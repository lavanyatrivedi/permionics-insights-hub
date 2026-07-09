import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase, type CaseStudyRow } from "../lib/supabase";

const router: IRouter = Router();

function mapRow(row: CaseStudyRow) {
  return {
    id: row.id,
    clientName: row.client_name,
    sector: row.sector,
    location: row.location,
    challenge: row.challenge,
    solution: row.solution,
    technologyStack: row.technology_stack,
    capacity: row.capacity,
    results: row.results,
    testimonial: row.testimonial,
    tags: row.tags ?? [],
    fullText: row.full_text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get("/case-studies", requireAuth, async (req, res): Promise<void> => {
  try {
    const { sector, technology, search } = req.query as {
      sector?: string;
      technology?: string;
      search?: string;
    };

    let query = supabase
      .from("case_studies")
      .select("*")
      .order("created_at", { ascending: false });

    if (sector) {
      query = query.eq("sector", sector);
    }
    if (technology) {
      query = query.ilike("technology_stack", `%${technology}%`);
    }
    if (search) {
      // Escape special characters to prevent malformed PostgREST filter expressions
      const escaped = search.replace(/[%_\\'"`,{}()]/g, (c) => `\\${c}`);
      query = query.or(
        `client_name.ilike.%${escaped}%,full_text.ilike.%${escaped}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      req.log.error({ err: error }, "Failed to list case studies");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.json((data ?? []).map(mapRow));
  } catch (err) {
    req.log.error({ err }, "List case studies error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/case-studies", requireAuth, async (req, res): Promise<void> => {
  try {
    const body = req.body as {
      clientName?: string;
      sector?: string;
      location?: string;
      challenge?: string;
      solution?: string;
      technologyStack?: string;
      capacity?: string;
      results?: string;
      testimonial?: string | null;
      tags?: string[];
      fullText?: string;
    };

    if (!body.clientName || !body.sector || !body.challenge || !body.solution) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("case_studies")
      .insert({
        client_name: body.clientName,
        sector: body.sector,
        location: body.location ?? "",
        challenge: body.challenge,
        solution: body.solution,
        technology_stack: body.technologyStack ?? "",
        capacity: body.capacity ?? "",
        results: body.results ?? "",
        testimonial: body.testimonial ?? null,
        tags: body.tags ?? [],
        full_text: body.fullText ?? `${body.clientName} ${body.sector} ${body.challenge} ${body.solution} ${body.results}`,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      req.log.error({ err: error }, "Failed to create case study");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.status(201).json(mapRow(data as CaseStudyRow));
  } catch (err) {
    req.log.error({ err }, "Create case study error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Case study not found" });
      return;
    }

    res.json(mapRow(data as CaseStudyRow));
  } catch (err) {
    req.log.error({ err }, "Get case study error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const body = req.body as {
      clientName?: string;
      sector?: string;
      location?: string;
      challenge?: string;
      solution?: string;
      technologyStack?: string;
      capacity?: string;
      results?: string;
      testimonial?: string | null;
      tags?: string[];
      fullText?: string;
    };

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.clientName !== undefined) updates["client_name"] = body.clientName;
    if (body.sector !== undefined) updates["sector"] = body.sector;
    if (body.location !== undefined) updates["location"] = body.location;
    if (body.challenge !== undefined) updates["challenge"] = body.challenge;
    if (body.solution !== undefined) updates["solution"] = body.solution;
    if (body.technologyStack !== undefined) updates["technology_stack"] = body.technologyStack;
    if (body.capacity !== undefined) updates["capacity"] = body.capacity;
    if (body.results !== undefined) updates["results"] = body.results;
    if (body.testimonial !== undefined) updates["testimonial"] = body.testimonial;
    if (body.tags !== undefined) updates["tags"] = body.tags;
    if (body.fullText !== undefined) updates["full_text"] = body.fullText;

    const { data, error } = await supabase
      .from("case_studies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Case study not found" });
      return;
    }

    res.json(mapRow(data as CaseStudyRow));
  } catch (err) {
    req.log.error({ err }, "Update case study error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const { error } = await supabase.from("case_studies").delete().eq("id", id);

    if (error) {
      req.log.error({ err: error }, "Failed to delete case study");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Delete case study error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
