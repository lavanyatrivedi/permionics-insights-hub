import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

function mapCaseStudyRow(row: any) {
  return {
    id: Number(row.id),
    clientName: row.client_name,
    sector: row.sector,
    location: row.location || "",
    challenge: row.challenge || "",
    solution: row.solution || "",
    technologyStack: row.technology_stack || "",
    capacity: row.capacity || "",
    results: row.results || "",
    testimonial: row.testimonial,
    tags: row.tags || [],
    fullText: row.full_text || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// ─── 1. REAL CASE STUDIES LIBRARY ENDPOINTS (/api/case-studies) ──────────────
// ============================================================================

// List all library case studies
router.get("/case-studies", requireAuth, async (req, res): Promise<void> => {
  try {
    const { search, sector, technology } = req.query as {
      search?: string;
      sector?: string;
      technology?: string;
    };

    let dbQuery = supabase.from("case_studies").select("*");

    if (sector && sector !== "all") {
      dbQuery = dbQuery.ilike("sector", `%${sector}%`);
    }

    if (technology && technology !== "all") {
      dbQuery = dbQuery.ilike("technology_stack", `%${technology}%`);
    }

    if (search) {
      dbQuery = dbQuery.or(
        `client_name.ilike.%${search}%,challenge.ilike.%${search}%,solution.ilike.%${search}%,technology_stack.ilike.%${search}%`
      );
    }

    const { data, error } = await dbQuery.order("updated_at", { ascending: false });

    if (error) {
      req.log.error({ err: error }, "Failed to list case studies");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.json((data ?? []).map(mapCaseStudyRow));
  } catch (err) {
    req.log.error({ err }, "GET /case-studies error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new library case study
router.post("/case-studies", requireAuth, async (req, res): Promise<void> => {
  try {
    const body = req.body;
    const insertData = {
      client_name: body.clientName,
      sector: body.sector,
      location: body.location || "",
      challenge: body.challenge || "",
      solution: body.solution || "",
      technology_stack: body.technologyStack || "",
      capacity: body.capacity || "",
      results: body.results || "",
      testimonial: body.testimonial || null,
      tags: body.tags || [],
      full_text: body.fullText || "",
    };

    const { data: row, error } = await supabase
      .from("case_studies")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      req.log.error({ err: error }, "Failed to create case study");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.status(201).json(mapCaseStudyRow(row));
  } catch (err) {
    req.log.error({ err }, "POST /case-studies error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single library case study by ID
router.get("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      req.log.error({ err: error }, "Failed to get case study");
      res.status(404).json({ error: "Case study not found" });
      return;
    }

    res.json(mapCaseStudyRow(data));
  } catch (err) {
    req.log.error({ err }, "GET /case-studies/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Download static PDF or get indicator for case study
router.get("/case-studies/:id/download", requireAuth, async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Case study not found" });
      return;
    }

    const clientName = (data.client_name || "").toLowerCase();
    let pdfFile = "";

    if (clientName.includes("gropello") || clientName.includes("european pharmaceutical")) {
      pdfFile = "gropello.pdf";
    } else if (clientName.includes("jeedimetla") || clientName.includes("jetl")) {
      pdfFile = "jeedimetla.pdf";
    } else if (clientName.includes("stevia")) {
      pdfFile = "stevia.pdf";
    } else if (clientName.includes("nandesari") || clientName.includes("nia")) {
      pdfFile = "nandesari.pdf";
    } else if (clientName.includes("serratiopeptidase")) {
      pdfFile = "serratiopeptidase.pdf";
    }

    if (pdfFile) {
      const filePath = path.resolve(process.cwd(), "pdfs", pdfFile);
      if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${data.client_name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`);
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    res.json({ isStatic: false });
  } catch (err) {
    req.log.error({ err }, "GET /case-studies/:id/download error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a library case study
router.put("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const body = req.body;
    const patch: any = { updated_at: new Date().toISOString() };
    if (body.clientName !== undefined) patch.client_name = body.clientName;
    if (body.sector !== undefined) patch.sector = body.sector;
    if (body.location !== undefined) patch.location = body.location;
    if (body.challenge !== undefined) patch.challenge = body.challenge;
    if (body.solution !== undefined) patch.solution = body.solution;
    if (body.technologyStack !== undefined) patch.technology_stack = body.technologyStack;
    if (body.capacity !== undefined) patch.capacity = body.capacity;
    if (body.results !== undefined) patch.results = body.results;
    if (body.testimonial !== undefined) patch.testimonial = body.testimonial;
    if (body.tags !== undefined) patch.tags = body.tags;
    if (body.fullText !== undefined) patch.full_text = body.fullText;

    const { data: row, error } = await supabase
      .from("case_studies")
      .update(patch)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !row) {
      req.log.error({ err: error }, "Failed to update case study");
      res.status(404).json({ error: "Case study not found" });
      return;
    }

    res.json(mapCaseStudyRow(row));
  } catch (err) {
    req.log.error({ err }, "PUT /case-studies/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a library case study
router.delete("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const { error } = await supabase
      .from("case_studies")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      req.log.error({ err: error }, "Failed to delete case study");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "DELETE /case-studies/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================================================
// ─── 2. CASE STUDY CREATOR / GENERATOR ENDPOINTS (/api/case-creator) ────────
// ============================================================================

// List all case creator projects
router.get("/case-creator", requireAuth, async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("case_creator_projects")
      .select("id, name, palette, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      req.log.error({ err: error }, "Failed to list case creator projects");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.json(data ?? []);
  } catch (err) {
    req.log.error({ err }, "GET /case-creator error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new case creator project
router.post("/case-creator", requireAuth, async (req, res): Promise<void> => {
  try {
    const { name, palette, data } = req.body;

    if (!name || !palette || !data) {
      res.status(400).json({ error: "name, palette, and data are required" });
      return;
    }

    const { data: row, error } = await supabase
      .from("case_creator_projects")
      .insert({ name, palette, data })
      .select()
      .single();

    if (error) {
      req.log.error({ err: error }, "Failed to create case creator project");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "POST /case-creator error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single case creator project by ID
router.get("/case-creator/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("case_creator_projects")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      req.log.error({ err: error }, "Failed to get case creator project");
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "GET /case-creator/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a case creator project
router.put("/case-creator/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const { name, palette, data } = req.body;

    const patch: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) patch.name = name;
    if (palette !== undefined) patch.palette = palette;
    if (data !== undefined) patch.data = data;

    const { data: row, error } = await supabase
      .from("case_creator_projects")
      .update(patch)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !row) {
      req.log.error({ err: error }, "Failed to update case creator project");
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(row);
  } catch (err) {
    req.log.error({ err }, "PUT /case-creator/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a case creator project
router.delete("/case-creator/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const { error } = await supabase
      .from("case_creator_projects")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      req.log.error({ err: error }, "Failed to delete case creator project");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "DELETE /case-creator/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
