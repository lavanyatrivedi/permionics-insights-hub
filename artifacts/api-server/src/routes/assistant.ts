import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";
import fs from "fs";
import os from "os";
import * as pdfParseModule from "pdf-parse";
const pdf = (pdfParseModule as any).default || pdfParseModule;

const router: IRouter = Router();

const upload = multer({ dest: os.tmpdir() });

router.post("/assistant/upload", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { path: tempPath, originalname } = req.file;

  try {
    // 1. Read PDF file and extract text locally
    const dataBuffer = fs.readFileSync(tempPath);
    const pdfData = await pdf(dataBuffer);
    const extractedText = pdfData.text;

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
    res.status(500).json({ error: err?.message || "Failed to process document" });
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
