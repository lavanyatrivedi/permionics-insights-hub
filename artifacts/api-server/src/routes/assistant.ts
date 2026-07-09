import { Router, type IRouter } from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";
import fs from "fs";
import path from "path";
import os from "os";

const router: IRouter = Router();

const apiKey = process.env["GEMINI_API_KEY"] ?? "";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const upload = multer({ dest: os.tmpdir() });

router.post("/assistant/upload", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { path: tempPath, originalname, mimetype } = req.file;

  try {
    // 1. Upload to Gemini File API for OCR
    const uploadResult = await fileManager.uploadFile(tempPath, {
      mimeType: mimetype,
      displayName: originalname,
    });

    // 2. Ask Gemini to extract text
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri
        }
      },
      { text: "Extract and return the full text content of this document exactly as it is. Do not summarize. Include all data from tables and paragraphs." },
    ]);

    const extractedText = result.response.text();

    // 3. Save to database
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
  } catch (err) {
    req.log.error({ err }, "Error processing document upload");
    res.status(500).json({ error: "Failed to process document" });
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
