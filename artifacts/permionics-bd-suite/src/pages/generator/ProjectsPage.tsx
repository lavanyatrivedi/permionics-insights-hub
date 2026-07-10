import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { customFetch } from "@workspace/api-client-react";
import { DEFAULT_DATA, PALETTES, getPalette } from "./creator_types";
import { useToast } from "@/hooks/use-toast";
import { Plus, ClipboardList } from "lucide-react";

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
      const res: any = await customFetch("/api/case-creator");
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
      const res: any = await customFetch("/api/case-creator", {
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
      await customFetch(`/api/case-creator/${deleteId}`, { method: "DELETE" });
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
    <div className="text-foreground" style={{ minHeight: "100vh", background: "var(--background)" }}>

      {/* Content */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "44px 32px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--foreground)", margin: 0, letterSpacing: "-0.5px" }}>Case Study Projects</h1>
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "5px" }}>
              {projects.length} project{projects.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4.5 py-2.5 rounded-lg text-xs shadow-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border-0"
            style={{
              boxShadow: "0 2px 8px rgba(12,74,140,0.15)",
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>

        {/* Create panel modal */}
        {isCreating && (
          <div style={{
            background: "var(--card)", borderRadius: "16px", padding: "28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid var(--border)",
            marginBottom: "32px", animation: "slideDown 0.2s ease-out",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--foreground)", margin: "0 0 18px 0" }}>Create New Project</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Project Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Nandesari Industries — RO Plant"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Colour Palette
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {PALETTES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setNewPalette(p.id)}
                      style={{
                        padding: "8px 16px", fontSize: "12px", fontWeight: 600,
                        borderRadius: "8px", border: "1px solid", cursor: "pointer",
                        borderColor: newPalette === p.id ? p.primary : "hsl(var(--border))",
                        background: newPalette === p.id ? `${p.primary}1c` : "hsl(var(--card))",
                        color: newPalette === p.id ? p.primary : "hsl(var(--muted-foreground))",
                        transition: "all 0.15s",
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button
                  onClick={() => { setIsCreating(false); setNewName(""); }}
                  style={{
                    background: "none", border: "none", color: "var(--muted-foreground)", fontSize: "13px",
                    fontWeight: 600, cursor: "pointer", padding: "8px 16px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4.5 py-2.5 rounded-lg text-xs shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50 border-0"
                  style={{
                    boxShadow: "0 2px 8px rgba(12,74,140,0.15)",
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
          <div style={{ textAlign: "center", padding: "80px", color: "var(--muted-foreground)", fontSize: "14px" }}>
            Loading projects...
          </div>
        ) : !projects.length && !isCreating ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/10">
            <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground/40 mb-4" />
            <p className="font-semibold text-muted-foreground mb-2 text-sm">No projects yet</p>
            <p className="text-xs text-muted-foreground mb-6">Create your first case study to get started.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-xs shadow-sm transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer border-0"
              style={{
                boxShadow: "0 2px 8px rgba(12,74,140,0.15)"
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Create Project
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
                    background: "var(--card)", borderRadius: "14px", overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid var(--border)",
                    transition: "all 0.18s", cursor: "pointer", userSelect: "none",
                  }}
                  onClick={() => openProject(project.id)}
                  onKeyDown={(e) => e.key === "Enter" && openProject(project.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = palette.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  {/* Color bar */}
                  <div style={{ background: palette.primary, height: "5px" }} />

                  <div style={{ padding: "20px 22px" }}>
                    {/* Name + delete */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "14px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", margin: 0, lineHeight: 1.3 }}>{project.name}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(project.id); }}
                        title="Delete project"
                        style={{
                          flexShrink: 0, padding: "5px", border: "none", background: "none",
                          cursor: "pointer", color: "var(--muted-foreground)", borderRadius: "5px",
                          transition: "color 0.15s", opacity: 0.5,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#ef4444";
                          e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--muted-foreground)";
                          e.currentTarget.style.opacity = "0.5";
                        }}
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
                        <span style={{ fontSize: "11px", color: "var(--muted-foreground)", marginLeft: "5px" }}>{palette.name}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "32px", width: "380px", boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--foreground)", marginBottom: "12px", marginTop: 0 }}>Delete project?</h3>
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "24px" }}>This action cannot be undone. The project and all its data will be permanently deleted.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: "8px", background: "var(--card)", fontSize: "13px", cursor: "pointer", color: "var(--muted-foreground)", fontWeight: 500 }}>
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
