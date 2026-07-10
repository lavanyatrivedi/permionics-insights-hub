import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";
import Groq from "groq-sdk";

const router: IRouter = Router();

const apiKey = process.env["GROQ_API_KEY"] ?? "";
const groq = new Groq({ apiKey });

// Stop words — excluded from keyword scoring so they don't inflate irrelevant docs
const STOP_WORDS = new Set([
  "what", "where", "how", "why", "when", "who", "which", "whose", "whom",
  "that", "this", "these", "those", "have", "has", "had", "do", "does", "did",
  "shall", "will", "should", "would", "may", "might", "must", "can", "could",
  "about", "above", "across", "after", "against", "along", "among", "around", "at",
  "before", "behind", "below", "beneath", "beside", "between", "beyond", "but", "by",
  "down", "during", "except", "for", "from", "in", "inside", "into", "like", "near",
  "of", "off", "on", "onto", "out", "outside", "over", "past", "through", "throughout",
  "till", "to", "toward", "under", "underneath", "until", "up", "upon", "with", "within",
  "without", "give", "show", "tell", "summarize", "summary", "all", "list",
  "document", "documents", "file", "files", "pdf", "pdfs", "please", "you", "our",
  "their", "them", "they", "we", "us", "i", "a", "an", "the", "and", "or", "but", "is",
  "are", "was", "were", "be", "been", "being", "get", "got", "make", "made", "take", "took"
]);

// Compute keyword relevance score for a chunk of text
function computeRelevanceScore(text: string, searchTerms: string[]): number {
  if (!text || searchTerms.length === 0) return 0;
  const lowerText = text.toLowerCase();
  let score = 0;
  searchTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, "g");
    const matches = lowerText.match(regex);
    if (matches) {
      score += matches.length * 10; // strong: exact word boundary
    } else if (lowerText.includes(term)) {
      score += 2; // weak: substring
    }
  });
  return score;
}

// Safe truncate at a word boundary
function safeTruncate(text: string, maxChars: number): string {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  const cut = text.lastIndexOf(" ", maxChars);
  return (cut > 0 ? text.slice(0, cut) : text.slice(0, maxChars)) + "…";
}

router.post("/chat", requireAuth, async (req, res): Promise<void> => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Extract meaningful search terms
    const searchTerms = message
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w: string) => w.length >= 3 && !STOP_WORDS.has(w));

    // ── 1. Fetch ALL documents from all sources ─────────────────────────────
    const [uploadsResult, caseStudiesResult, creatorResult] = await Promise.all([
      supabase
        .from("assistant_documents")
        .select("id, title, content, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("case_studies")
        .select("id, client_name, sector, location, challenge, solution, technology_stack, capacity, results, testimonial, tags, full_text, updated_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("case_creator_projects")
        .select("id, name, data, updated_at")
        .order("updated_at", { ascending: false }),
    ]);

    const uploadedDocs = uploadsResult.data ?? [];
    const caseStudies = caseStudiesResult.data ?? [];
    const creatorProjects = creatorResult.data ?? [];

    // ── 2. Build scored items ────────────────────────────────────────────────
    interface ScoredItem {
      id: string;
      type: "uploaded" | "library" | "creator";
      title: string;
      fullContent: string;
      score: number;
    }
    const allItems: ScoredItem[] = [];

    uploadedDocs.forEach(doc => {
      const fullContent = `DOCUMENT: ${doc.title}\n${doc.content}`;
      const score = computeRelevanceScore(fullContent, searchTerms);
      allItems.push({ id: String(doc.id), type: "uploaded", title: doc.title, fullContent, score });
    });

    caseStudies.forEach(cs => {
      const fullContent = [
        `CLIENT: ${cs.client_name || ""}`,
        `SECTOR: ${cs.sector || ""}`,
        `LOCATION: ${cs.location || ""}`,
        `CAPACITY: ${cs.capacity || ""}`,
        `TECH: ${cs.technology_stack || ""}`,
        `CHALLENGE: ${cs.challenge || ""}`,
        `SOLUTION: ${cs.solution || ""}`,
        `RESULTS: ${cs.results || ""}`,
        `TESTIMONIAL: ${cs.testimonial || ""}`,
        `DETAIL: ${cs.full_text || ""}`,
      ].join("\n");
      const score = computeRelevanceScore(fullContent, searchTerms);
      allItems.push({ id: String(cs.id), type: "library", title: cs.client_name || "Unnamed", fullContent, score });
    });

    creatorProjects.forEach(proj => {
      if (!proj.data) return;
      const d = proj.data as any;
      const fullContent = [
        `PROJECT: ${proj.name}`,
        `CLIENT: ${d.client || ""}`,
        `SECTOR: ${d.sector || ""}`,
        `APPLICATION: ${d.application || ""}`,
        `CAPACITY: ${d.capacity || ""}`,
        `CHALLENGE: ${d.challenge || ""}`,
        `SOLUTION: ${d.solution || ""}`,
        `OUTCOMES: ${(d.bullets || []).join(" | ")}`,
        `TECH: ${(d.technologies || []).join(", ")}`,
      ].join("\n");
      const score = computeRelevanceScore(fullContent, searchTerms);
      allItems.push({ id: String(proj.id), type: "creator", title: proj.name, fullContent, score });
    });

    // ── 3. Two-mode context building ─────────────────────────────────────────
    //
    // MODE A — Broad query (≤1 meaningful search term):
    //   Include ALL documents but with a short 250-char snippet each.
    //   This covers "summarize capabilities", "list all case studies", etc.
    //
    // MODE B — Specific query (≥2 meaningful search terms):
    //   Score every document and pick the top 6 highest-scoring ones,
    //   giving each 1500 chars so the AI has rich detail to answer from.
    //
    // Both modes stay well within Groq's 128k context window and TPM limits.

    let contextBlocks: string[] = [];
    let modeLabel: string;

    if (searchTerms.length <= 1) {
      // ── MODE A: broad sweep ─────────────────────────────────────────────
      modeLabel = "broad_sweep";
      allItems.forEach((item, i) => {
        contextBlocks.push(
          `--- [${i + 1}] ${item.title} (${item.type.toUpperCase()}) ---\n${safeTruncate(item.fullContent, 300)}`
        );
      });
    } else {
      // ── MODE B: keyword-ranked deep dive ───────────────────────────────
      modeLabel = "keyword_ranked";
      const ranked = [...allItems].sort((a, b) => b.score - a.score);

      // Top 6 by relevance score (can be from any source)
      const topRanked = ranked.filter(r => r.score > 0).slice(0, 6);

      // If fewer than 3 matched, pad with most recent uploads (so at least uploads are seen)
      if (topRanked.length < 3) {
        const recentUploads = uploadedDocs
          .slice(0, 5)
          .filter(doc => !topRanked.find(r => r.id === String(doc.id)));
        recentUploads.forEach(doc => {
          topRanked.push({
            id: String(doc.id),
            type: "uploaded",
            title: doc.title,
            fullContent: `DOCUMENT: ${doc.title}\n${doc.content}`,
            score: 0,
          });
        });
      }

      const selected = topRanked.slice(0, 6);
      selected.forEach((item, i) => {
        contextBlocks.push(
          `--- [${i + 1}] ${item.title} (${item.type.toUpperCase()}) ---\n${safeTruncate(item.fullContent, 1500)}`
        );
      });
    }

    // ── 4. Build system prompt ──────────────────────────────────────────────
    const systemContext = `You are OSMOS BD Assistant — an expert Business Development AI for Permionics Membranes Pvt. Ltd., a leading membrane technology company specialising in Reverse Osmosis (RO), Ultrafiltration (UF), Nanofiltration (NF), MBR, and Zero Liquid Discharge (ZLD) systems.

Your role:
- Answer questions about past projects, technical capabilities, and client outcomes using the provided reference documents.
- When answering broad questions, synthesise information across ALL provided documents.
- When answering specific questions, focus on the most relevant documents and quote exact metrics/numbers where available.
- Cite references inline using clean bracketed numbers like [1], [2] corresponding to the list below.
- CRITICAL CITATION RULE: Do NOT write verbose names, markdown links (e.g., no [Client](LIBRARY)), or inline source tags (e.g., no (LIBRARY) or (UPLOADED)) inside the text response. Keep references strictly as simple bracketed numbers like [1].
- If you cannot find specific information, say so clearly.

REFERENCE DOCUMENTS (${modeLabel === "broad_sweep" ? `ALL ${allItems.length} documents — brief excerpts` : `Top ${contextBlocks.length} most relevant documents — detailed`}):

${contextBlocks.join("\n\n")}`;

    // ── 5. Call Groq ────────────────────────────────────────────────────────
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
      max_tokens: 1200,
      temperature: 0.3,
    });

    const fullResponse = completion.choices[0]?.message?.content || "No response generated.";

    // ── 6. Save to chat history ─────────────────────────────────────────────
    try {
      await supabase.from("chats").insert([
        { role: "user", content: message },
        { role: "assistant", content: fullResponse },
      ]);
    } catch (err) {
      req.log.error({ err }, "Failed to save chat history to database");
    }

    // Map matched references into clean frontend citations
    const matchedDocs = modeLabel === "broad_sweep" ? allItems.slice(0, 5) : (allItems.filter(r => r.score > 0).slice(0, 6));
    const sourcesList = matchedDocs.map(item => ({
      id: item.id,
      clientName: item.title,
      sector: item.type === "uploaded" ? "PDF Document" : item.type === "library" ? "Case Library" : "Project Creator"
    }));

    res.json({
      answer: fullResponse,
      sources: sourcesList,
      contextSummary: {
        uploadedDocs: uploadedDocs.length,
        caseStudies: caseStudies.length,
        creatorProjects: creatorProjects.length,
        total: allItems.length,
        mode: modeLabel,
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
