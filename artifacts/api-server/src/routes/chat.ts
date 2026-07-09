import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";
import Groq from "groq-sdk";

const router: IRouter = Router();

const apiKey = process.env["GROQ_API_KEY"] ?? "";
const groq = new Groq({ apiKey });

// Helper to sanitize search term and compute relevance score
function computeRelevanceScore(text: string, searchTerms: string[]): number {
  if (!text || searchTerms.length === 0) return 0;
  const lowerText = text.toLowerCase();
  let score = 0;
  searchTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'g');
    const wordMatches = lowerText.match(regex);
    if (wordMatches) {
      score += wordMatches.length * 5; // high weight for exact word match
    } else if (lowerText.includes(term)) {
      score += 2;
    }
  });
  return score;
}

router.post("/chat", requireAuth, async (req, res): Promise<void> => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Extract search terms (words of length >= 3)
    const searchTerms = message
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w: string) => w.length >= 3);

    // ── 1. Pull all uploaded PDF documents ─────────────────────────────────
    const { data: uploadedDocs } = await supabase
      .from("assistant_documents")
      .select("id, title, content, created_at")
      .order("created_at", { ascending: false });

    // ── 2. Pull all case studies from the Library ───────────────────────────
    const { data: caseStudies } = await supabase
      .from("case_studies")
      .select("id, client_name, sector, location, challenge, solution, technology_stack, capacity, results, testimonial, tags, full_text, updated_at")
      .order("updated_at", { ascending: false });

    // ── 3. Pull all Case Study Creator projects ─────────────────────────────
    const { data: creatorProjects } = await supabase
      .from("case_creator_projects")
      .select("id, name, data, updated_at")
      .order("updated_at", { ascending: false });

    // ── 4. Score all documents for keyword relevance ───────────────────────
    const allScoredItems: any[] = [];

    // Map and score uploaded PDFs
    (uploadedDocs ?? []).forEach(doc => {
      const score = computeRelevanceScore(`${doc.title} ${doc.content}`, searchTerms);
      allScoredItems.push({
        id: doc.id,
        type: "uploaded",
        title: doc.title,
        content: doc.content,
        score,
        date: doc.created_at || ""
      });
    });

    // Map and score Library Case Studies
    (caseStudies ?? []).forEach(cs => {
      const fullTextToSearch = `${cs.client_name} ${cs.sector} ${cs.challenge} ${cs.solution} ${cs.results} ${cs.full_text} ${cs.technology_stack}`;
      const score = computeRelevanceScore(fullTextToSearch, searchTerms);
      
      let formatted = `CLIENT: ${cs.client_name || "Unnamed"}
SECTOR: ${cs.sector || "Unknown"}
LOCATION: ${cs.location || ""}
CAPACITY: ${cs.capacity || ""}
TECH STACK: ${cs.technology_stack || ""}
CHALLENGE: ${cs.challenge || ""}
SOLUTION: ${cs.solution || ""}
RESULTS: ${cs.results || ""}
TESTIMONIAL: ${cs.testimonial || ""}
DETAILS: ${cs.full_text || ""}`;

      allScoredItems.push({
        id: String(cs.id),
        type: "library",
        title: cs.client_name,
        content: formatted,
        score,
        date: cs.updated_at || ""
      });
    });

    // Map and score Creator Projects
    (creatorProjects ?? []).forEach(proj => {
      if (!proj.data) return;
      const d = proj.data as any;
      const fullTextToSearch = `${proj.name} ${d.client} ${d.sector} ${d.challenge} ${d.solution} ${d.application} ${d.capacity} ${(d.bullets || []).join(" ")}`;
      const score = computeRelevanceScore(fullTextToSearch, searchTerms);

      let formatted = `PROJECT: ${proj.name}
CLIENT: ${d.client || ""}
SECTOR: ${d.sector || ""}
APPLICATION: ${d.application || ""}
CAPACITY: ${d.capacity || ""}
CHALLENGE: ${d.challenge || ""}
SOLUTION: ${d.solution || ""}
KEY OUTCOMES: ${(d.bullets || []).join(" | ")}
TECHNOLOGIES: ${(d.technologies || []).join(", ")}`;

      allScoredItems.push({
        id: String(proj.id),
        type: "creator",
        title: proj.name,
        content: formatted,
        score,
        date: proj.updated_at || ""
      });
    });

    // ── 5. Select items to include in Context (Smart Union) ──────────────────
    const selectedItemsMap = new Map<string, any>();

    // A. Always include the 2 most recently uploaded PDFs (so chatbot has access to current uploads)
    const recentUploads = allScoredItems.filter(item => item.type === "uploaded").slice(0, 2);
    recentUploads.forEach(item => selectedItemsMap.set(`${item.type}-${item.id}`, item));

    // B. Always include the 2 most recent Library Case Studies
    const recentLibrary = allScoredItems.filter(item => item.type === "library").slice(0, 2);
    recentLibrary.forEach(item => selectedItemsMap.set(`${item.type}-${item.id}`, item));

    // C. Always include the 1 most recent Creator Project
    const recentCreator = allScoredItems.filter(item => item.type === "creator").slice(0, 1);
    recentCreator.forEach(item => selectedItemsMap.set(`${item.type}-${item.id}`, item));

    // D. Add any other items that have high keyword relevance score (> 5) and aren't already included
    const highRelevanceItems = allScoredItems
      .filter(item => item.score >= 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2); // limit to 2 additional relevant matches to conserve tokens
    
    highRelevanceItems.forEach(item => {
      const key = `${item.type}-${item.id}`;
      if (!selectedItemsMap.has(key)) {
        selectedItemsMap.set(key, item);
      }
    });

    const finalSelectedItems = Array.from(selectedItemsMap.values());

    // ── 6. Build system prompt ──────────────────────────────────────────────
    let systemContext = `You are OSMOS BD Assistant — an expert Business Development AI for Permionics Membranes Pvt. Ltd., a leading membrane technology company specialising in Reverse Osmosis (RO), Ultrafiltration (UF), Nanofiltration (NF), MBR, and Zero Liquid Discharge (ZLD) systems.

Your role:
- Answer questions about past projects, technical capabilities, and client outcomes using the provided reference documents.
- If a specific case isn't in the reference documents, say so clearly and suggest what general capability data is available.

Always be concise, professional, and specific. Prefer bullet points for technical specs. Cite client names and capacity numbers from the reference documents.`;

    if (finalSelectedItems.length > 0) {
      systemContext += `\n\nUse the following provided reference documents (most relevant to the user query) to answer the user's questions:\n`;
      finalSelectedItems.forEach((item, idx) => {
        // Keep document snippet size safe (max 2500 chars) to prevent context token overflow
        systemContext += `\n--- Document ${idx + 1}: ${item.title} (${item.type.toUpperCase()}) ---\n${item.content.slice(0, 2500)}\n`;
      });
    }

    // ── 7. Build messages ───────────────────────────────────────────────────
    const messages = [
      { role: "system", content: systemContext },
      ...history.slice(-6).map((h: any) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama-3.3-70b-versatile",
      stream: false,
      max_tokens: 1000,
      temperature: 0.3,
    });

    const fullResponse = completion.choices[0]?.message?.content || "No response generated.";

    // Save to chat history
    try {
      await supabase.from("chats").insert([
        { role: "user", content: message },
        { role: "assistant", content: fullResponse },
      ]);
    } catch (err) {
      req.log.error({ err }, "Failed to save chat history to database");
    }

    res.json({
      answer: fullResponse,
      sources: [],
      contextSummary: {
        uploadedDocs: finalSelectedItems.filter(d => d.type === "uploaded").length,
        caseStudies: finalSelectedItems.filter(d => d.type === "library").length,
        creatorProjects: finalSelectedItems.filter(d => d.type === "creator").length,
        total: finalSelectedItems.length,
      },
    });
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
    const { error } = await supabase
      .from("chats")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

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
