import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";
import Groq from "groq-sdk";

const router: IRouter = Router();

const apiKey = process.env["GROQ_API_KEY"] ?? "";
const groq = new Groq({ apiKey });

router.post("/chat", requireAuth, async (req, res): Promise<void> => {
  try {
    const { message, history = [], contextIds = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    let systemContext = `You are Permionics AI, an intelligent BD assistant. Be helpful, professional, and concise.`;

    if (contextIds.length > 0) {
      const { data: documents } = await supabase
        .from("assistant_documents")
        .select("title, content")
        .in("id", contextIds);

      if (documents && documents.length > 0) {
        systemContext += `\n\nUse the following provided context to answer the user's questions:\n`;
        documents.forEach((doc, i) => {
          systemContext += `\n--- Document: ${doc.title} ---\n${doc.content}\n`;
        });
      }
    }

    const messages = [
      { role: "system", content: systemContext },
      ...history.map((h: any) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      { role: "user", content: message }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama3-8b-8192",
      stream: false,
    });

    const fullResponse = completion.choices[0]?.message?.content || "No response generated.";

    // Save chat history
    try {
      await supabase.from("chats").insert([
        { role: "user", content: message },
        { role: "assistant", content: fullResponse }
      ]);
    } catch (err) {
      req.log.error({ err }, "Failed to save chat history to database");
    }

    res.json({ answer: fullResponse, sources: [] });
  } catch (err: any) {
    req.log.error({ err }, "Chat Error");
    res.status(500).json({ error: err.message || "An error occurred" });
  }
});

router.get("/chat/history", requireAuth, async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("id, role, content, created_at")
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
      return;
    }

    res.json(data ?? []);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/chat/history", requireAuth, async (req, res): Promise<void> => {
  try {
    // Delete all chat history
    const { error } = await supabase
      .from("chats")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Hack to delete all

    if (error) {
      res.status(500).json({ error: "Failed to clear chat history" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
