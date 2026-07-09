import { Router, type IRouter } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"] ?? "");

type HistoryItem = { role: string; content: string };

function scoreRelevance(caseStudy: Record<string, unknown>, query: string): number {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3);
  const fullText = ((caseStudy["full_text"] as string) ?? "").toLowerCase();
  const clientName = ((caseStudy["client_name"] as string) ?? "").toLowerCase();
  const sector = ((caseStudy["sector"] as string) ?? "").toLowerCase();
  const techStack = ((caseStudy["technology_stack"] as string) ?? "").toLowerCase();
  const tags = ((caseStudy["tags"] as string[]) ?? []).join(" ").toLowerCase();

  let score = 0;
  if (clientName && queryLower.includes(clientName)) score += 10;
  if (sector && queryLower.includes(sector)) score += 5;
  if (techStack) {
    const techTerms = techStack.split(/[,\s\/]+/);
    for (const term of techTerms) {
      if (term.length > 1 && queryLower.includes(term)) score += 3;
    }
  }
  if (tags) {
    const tagList = tags.split(/[,\s]+/);
    for (const tag of tagList) {
      if (tag.length > 2 && queryLower.includes(tag)) score += 2;
    }
  }
  for (const word of queryWords) {
    if (fullText.includes(word)) score += 1;
  }
  const capacityMatch = query.match(/(\d+)\s*(kld|mld|m3|lph|lpm|lpd)/i);
  if (capacityMatch) {
    const requestedVal = parseInt(capacityMatch[1], 10);
    const capacityStr = ((caseStudy["capacity"] as string) ?? "").toLowerCase();
    const csCapacityMatch = capacityStr.match(/(\d+)/);
    if (csCapacityMatch) {
      const csVal = parseInt(csCapacityMatch[1], 10);
      if (csVal >= requestedVal) score += 4;
    }
  }
  return score;
}

router.post("/chat", requireAuth, async (req, res): Promise<void> => {
  try {
    const body = req.body as {
      message?: string;
      history?: HistoryItem[];
    };

    if (!body.message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const { message, history = [] } = body;

    // Retrieve case studies
    const { data: allCaseStudies, error: dbError } = await supabase
      .from("case_studies")
      .select("id, client_name, sector, technology_stack, capacity, results, full_text, tags")
      .order("created_at", { ascending: false });

    // Retrieve uploaded assistant documents
    const { data: uploadedDocs } = await supabase
      .from("assistant_documents")
      .select("title, content")
      .order("created_at", { ascending: false });

    if (dbError) {
      req.log.error({ err: dbError }, "Failed to fetch case studies for chat");
      res.status(500).json({ error: "Database error" });
      return;
    }

    const caseStudies = allCaseStudies ?? [];

    // Score and rank case studies by relevance
    const scored = caseStudies
      .map((cs) => ({
        cs,
        score: scoreRelevance(cs as Record<string, unknown>, message),
      }))
      .sort((a, b) => b.score - a.score);

    const relevant = scored.filter((s) => s.score > 0).slice(0, 3);
    const sources = relevant.map((s) => ({
      id: s.cs.id,
      clientName: s.cs.client_name,
      sector: s.cs.sector,
      technologyStack: s.cs.technology_stack,
    }));

    let context = "";
    if (relevant.length > 0) {
      context +=
        "RELEVANT CASE STUDIES FROM PERMIONICS DATABASE:\n\n" +
        relevant
          .map((s) => {
            const cs = s.cs;
            return `--- Case Study: ${cs.client_name} (${cs.sector}) ---\nTechnology: ${cs.technology_stack}\nCapacity: ${cs.capacity}\nResults: ${cs.results}\nFull Details: ${cs.full_text}\n`;
          })
          .join("\n\n");
    }

    if (uploadedDocs && uploadedDocs.length > 0) {
      context += "\n\nADDITIONAL UPLOADED DOCUMENTS (OCR extracted):\n\n" + 
        uploadedDocs.map(doc => `--- Document: ${doc.title} ---\n${doc.content}\n`).join("\n\n");
    }

    if (!context) {
      context = "No directly relevant case studies or uploaded documents were found.";
    }

    const systemInstruction = `You are the Permionics BD Assistant, an expert internal tool for the business development team at Permionics Membranes Pvt. Ltd. - a leading manufacturer of customised membrane filtration solutions in India.

Your role is to help the BD team by answering questions about Permionics projects, technical capabilities, and sector-specific solutions.

STRICT RULES:
1. Base your answers ONLY on the case studies provided as context. Do not invent project details, client names, or technical specifications not present in the data.
2. If no relevant case study is found, say so clearly and suggest adding a new case study for that scenario.
3. Always cite which case study or studies you are drawing from.
4. You may provide general membrane technology knowledge as background, but always distinguish it from specific Permionics project data.
5. Be precise, professional, and concise. No startup jargon or filler phrases.
6. Do not use em dashes in your responses.
7. When asked for pitch angles or sales language, be specific and factual - cite actual results from projects.

${context}`;

    // Build Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
    });

    // Build chat history for Gemini (role must be "user" | "model")
    const recentHistory = history.slice(-8);
    const geminiHistory = recentHistory
      .filter((h) => h.role === "user" || h.role === "assistant")
      .map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    const answer = result.response.text() || "Unable to generate a response.";

    res.json({ answer, sources });
  } catch (err) {
    req.log.error({ err }, "Chat error");
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

export default router;
