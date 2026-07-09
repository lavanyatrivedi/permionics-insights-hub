import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPalette, setNewPalette] = useState("ocean-blue");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res: any = await customFetch("/api/case-studies");
      setProjects(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const res: any = await customFetch("/api/case-studies", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim(), palette: newPalette, data: DEFAULT_DATA }),
      });
      navigate(`/editor/${res.id}`);
    } catch (err: any) {
      toast({ title: "Failed to create", description: err.message, variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      await customFetch(`/api/case-studies/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      toast({ title: "Deleted", description: "Case study removed." });
      await fetchProjects();
    } catch (err: any) {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const openProject = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/editor/${id}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>

      {/* Content */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "44px 32px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>Case Study Projects</h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "5px" }}>
              {projects.length} project{projects.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            style={{
              background: "#0C4A8C", color: "white", border: "none", borderRadius: "10px",
              padding: "11px 22px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 2px 8px rgba(12,74,140,0.3)",
              transition: "all 0.15s",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </button>
        </div>

        {/* New project form */}
        {isCreating && (
          <div style={{
            background: "white", borderRadius: "14px", padding: "28px",
            marginBottom: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
            border: "1px solid #e2e8f0",
          }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "20px", marginTop: 0 }}>Create New Project</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Project Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Nandesari Industries — RO Plant"
                  style={{
                    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
                    borderRadius: "8px", fontSize: "13px", outline: "none",
                    boxSizing: "border-box", transition: "border-color 0.15s",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Colour Palette
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {PALETTES.map((p) => (
                    <button key={p.id} onClick={() => setNewPalette(p.id)} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "8px 14px", borderRadius: "8px",
                      border: newPalette === p.id ? `2px solid ${p.accent}` : "2px solid #e2e8f0",
                      background: newPalette === p.id ? p.light : "white",
                      cursor: "pointer", fontSize: "12px", fontWeight: 600,
                      color: newPalette === p.id ? p.primary : "#64748b",
                      transition: "all 0.15s",
                    }}>
                      <div style={{ display: "flex", gap: "3px" }}>
                        <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: p.primary }} />
                        <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: p.accent }} />
                      </div>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button onClick={() => { setIsCreating(false); setNewName(""); }} style={{ padding: "9px 18px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "white", fontSize: "13px", cursor: "pointer", color: "#64748b", fontWeight: 500 }}>
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || isSubmitting}
                  style={{
                    padding: "9px 22px", border: "none", borderRadius: "8px",
                    background: newName.trim() ? "#0C4A8C" : "#94a3b8",
                    color: "white", fontSize: "13px", fontWeight: 700,
                    cursor: newName.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  {isSubmitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Project grid */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8", fontSize: "14px" }}>
            Loading projects...
          </div>
        ) : !projects.length && !isCreating ? (
          <div style={{
            textAlign: "center", padding: "80px 40px", background: "white",
            borderRadius: "16px", border: "2px dashed #cbd5e1",
          }}>
            <div style={{ fontSize: "42px", marginBottom: "14px" }}>📄</div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>No projects yet</p>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "24px" }}>Create your first case study to get started.</p>
            <button onClick={() => setIsCreating(true)} style={{ background: "#0C4A8C", color: "white", border: "none", borderRadius: "10px", padding: "11px 22px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              + New Project
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "18px" }}>
            {(projects ?? []).map((project) => {
              const palette = getPalette(project.palette);
              return (
                <div
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  style={{
                    background: "white", borderRadius: "14px", overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0",
                    transition: "all 0.18s", cursor: "pointer", userSelect: "none",
                  }}
                  onClick={() => openProject(project.id)}
                  onKeyDown={(e) => e.key === "Enter" && openProject(project.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.14)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = palette.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  {/* Color bar */}
                  <div style={{ background: palette.primary, height: "5px" }} />

                  <div style={{ padding: "20px 22px" }}>
                    {/* Name + delete */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "14px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>{project.name}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(project.id); }}
                        title="Delete project"
                        style={{
                          flexShrink: 0, padding: "5px", border: "none", background: "none",
                          cursor: "pointer", color: "#cbd5e1", borderRadius: "5px",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: palette.primary }} />
                        <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: palette.accent }} />
                        <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "5px" }}>{palette.name}</span>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "white", borderRadius: "14px", padding: "32px", width: "380px", boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", marginTop: 0 }}>Delete project?</h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>This action cannot be undone. The project and all its data will be permanently deleted.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "9px 18px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "white", fontSize: "13px", cursor: "pointer", color: "#64748b", fontWeight: 500 }}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ padding: "9px 18px", border: "none", borderRadius: "8px", background: "#dc2626", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
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
