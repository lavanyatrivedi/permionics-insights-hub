import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
import { GoogleGenAI } from "@google/genai";

const require = createRequire(import.meta.url);

const router: IRouter = Router();
const upload = multer({ dest: os.tmpdir() });

const geminiKey = process.env["GEMINI_API_KEY"] ?? process.env["GOOGLE_API_KEY"] ?? "";
const ai = new GoogleGenAI({ apiKey: geminiKey });

// ── Text extraction: try pdf-parse first, then fall back to Gemini Vision OCR ─

async function extractTextWithPdfParse(filePath: string): Promise<string> {
  try {
    const pdfParse = require("pdf-parse");
    const dataBuffer = fs.readFileSync(filePath);
    const result = await pdfParse(dataBuffer);
    return (result.text || "").trim();
  } catch (err) {
    return "";
  }
}

async function extractTextWithGeminiOCR(filePath: string, filename: string): Promise<string> {
  // Send the raw PDF bytes directly to Gemini as an inline blob — works for multi-page PDFs
  // Gemini Flash 2.0 natively understands PDFs and can extract text from scanned/image pages
  const pdfBytes = fs.readFileSync(filePath);
  const base64Pdf = pdfBytes.toString("base64");

  const model = ai.models;

  const response = await model.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            text: `Please extract ALL the text from this PDF document completely and accurately. 
Include all headings, paragraphs, tables, bullet points, numbers, and data.
Do NOT summarize — extract the full verbatim text. 
Format clearly with line breaks between sections.
This is the file: ${filename}`,
          },
        ],
      },
    ],
  });

  const text = response.candidates?.[0]?.content?.parts
    ?.map((p: any) => p.text || "")
    .join("\n")
    .trim();

  return text || "";
}

async function extractDocumentText(filePath: string, filename: string): Promise<{ text: string; method: "pdf-parse" | "gemini-ocr" }> {
  // 1. Try text extraction first (fast, free)
  const textFromParse = await extractTextWithPdfParse(filePath);

  // If we got meaningful text (>100 chars), use it
  if (textFromParse.length > 100) {
    return { text: textFromParse, method: "pdf-parse" };
  }

  // 2. Fall back to Gemini Vision OCR (for scanned/image PDFs)
  const textFromOCR = await extractTextWithGeminiOCR(filePath, filename);

  if (textFromOCR.length > 10) {
    return { text: textFromOCR, method: "gemini-ocr" };
  }

  throw new Error("Could not extract any text from this PDF. The file may be corrupt or password-protected.");
}

// ── Upload route ──────────────────────────────────────────────────────────────

router.post("/assistant/upload", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { path: tempPath, originalname } = req.file;

  try {
    const { text: extractedText, method } = await extractDocumentText(tempPath, originalname);

    const { data, error } = await supabase
      .from("assistant_documents")
      .insert({
        title: originalname,
        content: extractedText,
      })
      .select()
      .single();

    if (error) {
      req.log.error({ err: error }, "Database insert error for document");
      res.status(500).json({ error: "Failed to save document to database" });
      return;
    }

    res.json({ success: true, document: data, extractionMethod: method });
  } catch (err: any) {
    req.log.error({ err }, "Error processing document upload");
    res.status(500).json({ error: `Failed to process PDF: ${err?.message || err}` });
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
});

// ── Reprocess route: re-OCR an existing empty document ───────────────────────
// POST /api/assistant/documents/:id/reprocess  (with the file as multipart form)

router.post("/assistant/documents/:id/reprocess", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { path: tempPath, originalname } = req.file;

  try {
    // Force Gemini OCR regardless (user explicitly chose to reprocess)
    const textFromOCR = await extractTextWithGeminiOCR(tempPath, originalname);

    if (!textFromOCR || textFromOCR.length < 10) {
      throw new Error("OCR returned no usable text.");
    }

    const { data, error } = await supabase
      .from("assistant_documents")
      .update({ content: textFromOCR })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: "Failed to update document" });
      return;
    }

    res.json({ success: true, document: data, extractionMethod: "gemini-ocr" });
  } catch (err: any) {
    req.log.error({ err }, "Error reprocessing document");
    res.status(500).json({ error: `Reprocess failed: ${err?.message || err}` });
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
});

// ── List documents ────────────────────────────────────────────────────────────

router.get("/assistant/documents", requireAuth, async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("assistant_documents")
      .select("id, title, created_at, content")
      .order("created_at", { ascending: false });

    if (error) {
      res.status(500).json({ error: "Database error" });
      return;
    }

    // Return documents with a flag indicating if content is empty (needs reprocessing)
    const docs = (data ?? []).map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      created_at: doc.created_at,
      hasContent: (doc.content || "").trim().length > 50,
    }));

    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Delete document ───────────────────────────────────────────────────────────

router.delete("/assistant/documents/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const { error } = await supabase
      .from("assistant_documents")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
