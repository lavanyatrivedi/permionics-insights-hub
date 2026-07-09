import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});

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

  // Exact client name match is a strong signal
  if (clientName && queryLower.includes(clientName)) score += 10;

  // Sector match
  if (sector && queryLower.includes(sector)) score += 5;

  // Technology match
  if (techStack) {
    const techTerms = techStack.split(/[,\s\/]+/);
    for (const term of techTerms) {
      if (term.length > 1 && queryLower.includes(term)) score += 3;
    }
  }

  // Tag match
  if (tags) {
    const tagList = tags.split(/[,\s]+/);
    for (const tag of tagList) {
      if (tag.length > 2 && queryLower.includes(tag)) score += 2;
    }
  }

  // Full text keyword matching
  for (const word of queryWords) {
    if (fullText.includes(word)) score += 1;
  }

  // Check for capacity mentions (e.g. "500 KLD", "1000 m3")
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

    // Retrieve all case studies for RAG
    const { data: allCaseStudies, error: dbError } = await supabase
      .from("case_studies")
      .select("id, client_name, sector, technology_stack, capacity, results, full_text, tags")
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

    // Take top 3 relevant case studies (score > 0)
    const relevant = scored.filter((s) => s.score > 0).slice(0, 3);
    const sources = relevant.map((s) => ({
      id: s.cs.id,
      clientName: s.cs.client_name,
      sector: s.cs.sector,
      technologyStack: s.cs.technology_stack,
    }));

    // Build context string from relevant case studies
    let context = "";
    if (relevant.length > 0) {
      context =
        "RELEVANT CASE STUDIES FROM PERMIONICS DATABASE:\n\n" +
        relevant
          .map((s) => {
            const cs = s.cs;
            return `--- Case Study: ${cs.client_name} (${cs.sector}) ---\nTechnology: ${cs.technology_stack}\nCapacity: ${cs.capacity}\nResults: ${cs.results}\nFull Details: ${cs.full_text}\n`;
          })
          .join("\n");
    } else {
      context =
        "No directly relevant case studies were found in the Permionics database for this specific query.";
    }

    // Build system prompt
    const systemPrompt = `You are the Permionics BD Assistant, an expert internal tool for the business development team at Permionics Membranes Pvt. Ltd. - a leading manufacturer of customized membrane filtration solutions in India.

Your role is to help the BD team by answering questions about Permionics projects, technical capabilities, and sector-specific solutions.

STRICT RULES:
1. Base your answers ONLY on the case studies provided as context. Do not invent project details, client names, or technical specifications that are not present in the provided data.
2. If no relevant case study is found, say so clearly and suggest adding a new case study for that scenario.
3. Always cite which case study or studies you are drawing from.
4. You may provide general membrane technology knowledge as background, but always distinguish it from specific Permionics project data.
5. Be precise, professional, and concise. No startup jargon or filler phrases.
6. Do not use em dashes in your responses.
7. When asked for pitch angles or sales language, be specific and factual - cite actual results from projects.

${context}`;

    // Build message history for Claude
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history (up to last 8 turns to keep context manageable)
    const recentHistory = history.slice(-8);
    for (const h of recentHistory) {
      if (h.role === "user" || h.role === "assistant") {
        messages.push({
          role: h.role as "user" | "assistant",
          content: h.content,
        });
      }
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    const claudeResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const answer =
      claudeResponse.content[0]?.type === "text"
        ? claudeResponse.content[0].text
        : "Unable to generate a response.";

    res.json({ answer, sources });
  } catch (err) {
    req.log.error({ err }, "Chat error");
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

export default router;
