import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

// List all case studies
router.get("/case-studies", requireAuth, async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("case_creator_projects")
      .select("id, name, palette, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      req.log.error({ err: error }, "Failed to list case studies");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.json(data ?? []);
  } catch (err) {
    req.log.error({ err }, "Internal server error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new case study
router.post("/case-studies", requireAuth, async (req, res): Promise<void> => {
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
      req.log.error({ err: error }, "Failed to create case study");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Internal server error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single case study by ID
router.get("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("case_creator_projects")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      req.log.error({ err: error }, "Failed to get case study");
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Internal server error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a case study
router.put("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
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

    if (error) {
      req.log.error({ err: error }, "Failed to update case study");
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Internal server error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a case study
router.delete("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const { error } = await supabase
      .from("case_creator_projects")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      req.log.error({ err: error }, "Failed to delete case study");
      res.status(500).json({ error: "Database error" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Internal server error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
