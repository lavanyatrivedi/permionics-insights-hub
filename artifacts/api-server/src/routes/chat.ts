import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";
import Groq from "groq-sdk";

const router: IRouter = Router();

const apiKey = process.env["GROQ_API_KEY"] ?? "";
const groq = new Groq({ apiKey });

// Max characters per source to avoid blowing context window
const MAX_CHARS_PER_DOC = 4000;
const MAX_CASE_STUDIES = 30;

function truncate(text: string, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

router.post("/chat", requireAuth, async (req, res): Promise<void> => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // ── 1. Pull all uploaded PDF documents ─────────────────────────────────
    const { data: uploadedDocs } = await supabase
      .from("assistant_documents")
      .select("id, title, content")
      .order("created_at", { ascending: false });

    // ── 2. Pull all case studies from the Library ───────────────────────────
    const { data: caseStudies } = await supabase
      .from("case_studies")
      .select(
        "id, client_name, sector, location, challenge, solution, technology_stack, capacity, results, testimonial, tags, full_text"
      )
      .order("updated_at", { ascending: false })
      .limit(MAX_CASE_STUDIES);

    // ── 3. Also pull case study creator projects (rich JSON case studies) ───
    const { data: creatorProjects } = await supabase
      .from("case_creator_projects")
      .select("id, name, palette, data, updated_at")
      .order("updated_at", { ascending: false })
      .limit(20);

    // ── 4. Build system prompt ──────────────────────────────────────────────
    let systemContext = `You are OSMOS BD Assistant — an expert Business Development AI for Permionics Membranes Pvt. Ltd., a leading membrane technology company specialising in Reverse Osmosis (RO), Ultrafiltration (UF), Nanofiltration (NF), MBR, and Zero Liquid Discharge (ZLD) systems for pharma, dairy, water & wastewater, food & beverage, textile, CETP, and chemical sectors.

Your role:
- Answer questions about past projects, technical capabilities, and client outcomes using the provided knowledge base
- Help BD teams craft pitches, proposals, and client responses
- Cite specific projects, capacity numbers, results, and client names when relevant
- If a specific case isn't in the knowledge base, say so clearly and suggest what general capability data is available

Always be concise, professional, and specific. Prefer bullet points for technical specs. Mention client names and results when they support the answer.`;

    // Append uploaded PDF documents
    if (uploadedDocs && uploadedDocs.length > 0) {
      systemContext += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 UPLOADED REFERENCE DOCUMENTS (${uploadedDocs.length} files)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      uploadedDocs.forEach((doc, i) => {
        systemContext += `\n\n--- Document ${i + 1}: ${doc.title} ---\n${truncate(doc.content, MAX_CHARS_PER_DOC)}`;
      });
    }

    // Append Library case studies
    if (caseStudies && caseStudies.length > 0) {
      systemContext += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏭 PERMIONICS CASE STUDY LIBRARY (${caseStudies.length} projects)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      caseStudies.forEach((cs) => {
        const parts: string[] = [];
        if (cs.client_name) parts.push(`CLIENT: ${cs.client_name}`);
        if (cs.sector) parts.push(`SECTOR: ${cs.sector}`);
        if (cs.location) parts.push(`LOCATION: ${cs.location}`);
        if (cs.capacity) parts.push(`CAPACITY: ${cs.capacity}`);
        if (cs.technology_stack) parts.push(`TECHNOLOGY: ${cs.technology_stack}`);
        if (cs.challenge) parts.push(`CHALLENGE: ${truncate(cs.challenge, 500)}`);
        if (cs.solution) parts.push(`SOLUTION: ${truncate(cs.solution, 500)}`);
        if (cs.results) parts.push(`RESULTS: ${truncate(cs.results, 400)}`);
        if (cs.testimonial) parts.push(`TESTIMONIAL: ${truncate(cs.testimonial, 300)}`);
        if (cs.tags && cs.tags.length > 0) parts.push(`TAGS: ${cs.tags.join(", ")}`);
        if (cs.full_text) parts.push(`DETAILS: ${truncate(cs.full_text, 800)}`);
        systemContext += `\n\n--- ${cs.client_name || "Unnamed"} (${cs.sector || "Unknown Sector"}) ---\n${parts.join("\n")}`;
      });
    }

    // Append Case Study Creator projects (rich structured data)
    if (creatorProjects && creatorProjects.length > 0) {
      const validProjects = creatorProjects.filter(p => p.data && typeof p.data === "object");
      if (validProjects.length > 0) {
        systemContext += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CASE STUDY CREATOR PROJECTS (${validProjects.length} projects)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        validProjects.forEach((proj) => {
          try {
            const d = proj.data as any;
            const parts: string[] = [`PROJECT: ${proj.name}`];
            if (d.client) parts.push(`CLIENT: ${d.client}`);
            if (d.sector) parts.push(`SECTOR: ${d.sector}`);
            if (d.location) parts.push(`LOCATION: ${d.location}`);
            if (d.application) parts.push(`APPLICATION: ${d.application}`);
            if (d.capacity) parts.push(`CAPACITY: ${d.capacity}`);
            if (d.challenge) parts.push(`CHALLENGE: ${truncate(String(d.challenge), 400)}`);
            if (d.solution) parts.push(`SOLUTION: ${truncate(String(d.solution), 400)}`);
            if (d.deliveryModel) parts.push(`DELIVERY: ${d.deliveryModel}`);
            if (d.bullets && Array.isArray(d.bullets)) {
              parts.push(`KEY OUTCOMES: ${d.bullets.slice(0, 6).join(" | ")}`);
            }
            if (d.technologies && Array.isArray(d.technologies)) {
              parts.push(`TECHNOLOGIES: ${d.technologies.join(", ")}`);
            }
            if (d.titleHighlight) parts.push(`HIGHLIGHT: ${d.titleHighlight} ${d.title || ""}`);
            systemContext += `\n\n--- ${proj.name} ---\n${parts.join("\n")}`;
          } catch {
            // Skip malformed data
          }
        });
      }
    }

    // ── 5. Build messages ───────────────────────────────────────────────────
    const messages = [
      { role: "system", content: systemContext },
      ...history.map((h: any) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama-3.3-70b-versatile",
      stream: false,
      max_tokens: 1500,
      temperature: 0.4,
    });

    const fullResponse =
      completion.choices[0]?.message?.content || "No response generated.";

    // ── 6. Save to chat history ─────────────────────────────────────────────
    try {
      await supabase.from("chats").insert([
        { role: "user", content: message },
        { role: "assistant", content: fullResponse },
      ]);
    } catch (err) {
      req.log.error({ err }, "Failed to save chat history to database");
    }

    // Return how many sources were used
    const sourceCount =
      (uploadedDocs?.length ?? 0) +
      (caseStudies?.length ?? 0) +
      (creatorProjects?.filter((p) => p.data)?.length ?? 0);

    res.json({
      answer: fullResponse,
      sources: [],
      contextSummary: {
        uploadedDocs: uploadedDocs?.length ?? 0,
        caseStudies: caseStudies?.length ?? 0,
        creatorProjects: creatorProjects?.length ?? 0,
        total: sourceCount,
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
