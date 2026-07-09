import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PlusCircle, FileText, Trash2, Edit3, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { customFetch } from "@workspace/api-client-react";
import { DEFAULT_DATA, PALETTES, getPalette } from "./creator_types";
import { useToast } from "@/hooks/use-toast";

export default function ProjectsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPalette, setNewPalette] = useState("ocean-blue");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = () => {
    setIsLoading(true);
    customFetch("/api/case-studies")
      .then((res: any) => {
        setProjects(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      const res: any = await customFetch("/api/case-studies", {
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          palette: newPalette,
          data: DEFAULT_DATA,
        }),
      });
      navigate(`/generator/editor/${res.id}`);
    } catch (err: any) {
      toast({
        title: "Failed to create",
        description: err.message,
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      await customFetch(`/api/case-studies/${deleteId}`, { method: "DELETE" });
      fetchProjects();
      setDeleteId(null);
      setIsDeleting(false);
      toast({ title: "Deleted", description: "Case study removed." });
    } catch (err: any) {
      setIsDeleting(false);
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "#003466", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "#7ec8e3", fontWeight: 600 }}>Permionics</div>
          <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.2)" }} />
          <div style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>Case Study Creator</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1a2433", margin: 0 }}>Projects</h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              {projects?.length ?? 0} case {(projects?.length ?? 0) === 1 ? "study" : "studies"} saved
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            style={{ background: "#003466", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </button>
        </div>

        {/* New project form */}
        {isCreating && (
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a2433", marginBottom: "16px" }}>Create New Project</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Project Name</label>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Nandesari Industries — RO Plant"
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "7px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Colour Palette</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {PALETTES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setNewPalette(p.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "7px 12px",
                        border: newPalette === p.id ? `2px solid ${p.accent}` : "2px solid #e2e8f0",
                        borderRadius: "8px",
                        background: newPalette === p.id ? p.light : "white",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 500,
                        color: newPalette === p.id ? p.primary : "#64748b",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", gap: "3px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: p.primary }} />
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: p.accent }} />
                      </div>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button onClick={() => { setIsCreating(false); setNewName(""); }} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "white", fontSize: "13px", cursor: "pointer", color: "#64748b" }}>
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || isCreating} // Fixed typing logic mentally
                  style={{ padding: "8px 20px", border: "none", borderRadius: "7px", background: newName.trim() ? "#003466" : "#94a3b8", color: "white", fontSize: "13px", fontWeight: 600, cursor: newName.trim() ? "pointer" : "not-allowed" }}
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Project list */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "13px" }}>Loading projects...</div>
        ) : !projects?.length && !isCreating ? (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "white", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📄</div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>No projects yet</p>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>Create your first case study to get started.</p>
            <button onClick={() => setIsCreating(true)} style={{ background: "#003466", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              New Project
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {(projects ?? []).map((project) => {
              const palette = getPalette(project.palette);
              return (
                <div
                  key={project.id}
                  style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", transition: "box-shadow 0.15s", cursor: "pointer" }}
                  onClick={() => navigate(`/generator/editor/${project.id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}
                >
                  <div style={{ background: palette.primary, height: "6px" }} />
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "10px" }}>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a2433", margin: 0, lineHeight: 1.3 }}>{project.name}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(project.id); }}
                        style={{ flexShrink: 0, padding: "4px", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", borderRadius: "4px" }}
                        title="Delete project"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: palette.primary }} />
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: palette.accent }} />
                        <span style={{ fontSize: "10px", color: "#94a3b8", marginLeft: "4px" }}>{palette.name}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {new Date(project.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "28px", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a2433", marginBottom: "10px" }}>Delete project?</h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>This action cannot be undone. The project and all its data will be permanently deleted.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "white", fontSize: "13px", cursor: "pointer", color: "#64748b" }}>Cancel</button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ padding: "8px 16px", border: "none", borderRadius: "7px", background: "#dc2626", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
