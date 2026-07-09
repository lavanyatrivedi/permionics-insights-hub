import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";
import fs from "fs";
import os from "os";
// Polyfill DOMMatrix for Node.js to prevent pdfjs-dist crash
if (!(globalThis as any).DOMMatrix) {
  (globalThis as any).DOMMatrix = class DOMMatrix { constructor() { return {}; } };
}
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const router: IRouter = Router();

const upload = multer({ dest: os.tmpdir() });

const extractPdfText = async (filePath: string): Promise<string> => {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = pdfjsLib.getDocument({ data, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
};

router.post("/assistant/upload", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { path: tempPath, originalname } = req.file;

  try {
    // 1. Read PDF file and extract text locally using pdf2json
    const extractedText = await extractPdfText(tempPath);

    // 2. Save to database
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

    res.json({ success: true, document: data });
  } catch (err: any) {
    req.log.error({ err }, "Error processing document upload");
    res.status(500).json({ error: `Failed: ${err?.message || err}` });
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
});

router.get("/assistant/documents", requireAuth, async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("assistant_documents")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.json(data ?? []);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

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
