import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { customFetch } from "@workspace/api-client-react";
import { CaseStudyData, getPalette } from "./creator_types";
import { Sidebar } from "./creator_components/Sidebar";
import { CaseStudyPreview } from "./creator_components/CaseStudyPreview";
import { printCaseStudy } from "./creator_utils/print";

interface Props {
  projectId: number;
}

export default function EditorPage({ projectId }: Props) {
  const [, navigate] = useLocation();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<CaseStudyData | null>(null);
  const [palette, setPalette] = useState("ocean-blue");
  const [editableMode, setEditableMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDataRef = useRef<{ data: CaseStudyData; palette: string } | null>(null);

  useEffect(() => {
    customFetch(`/api/case-studies/${projectId}`)
      .then((res: any) => {
        setProject(res);
        setData(res.data as unknown as CaseStudyData);
        setPalette(res.palette ?? "ocean-blue");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [projectId]);

  const doSave = useCallback(async (saveData: CaseStudyData, savePalette: string) => {
    setSaveStatus("saving");
    try {
      await customFetch(`/api/case-studies/${projectId}`, {
        method: "PUT",
        body: JSON.stringify({ data: saveData, palette: savePalette }),
      });
      setSaveStatus("saved");
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("unsaved");
    }
  }, [projectId]);

  const scheduleAutosave = useCallback((newData: CaseStudyData, newPalette: string) => {
    setSaveStatus("unsaved");
    latestDataRef.current = { data: newData, palette: newPalette };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (latestDataRef.current) {
        doSave(latestDataRef.current.data, latestDataRef.current.palette);
      }
    }, 1500);
  }, [doSave]);

  const handleDataChange = (newData: CaseStudyData) => {
    setData(newData);
    scheduleAutosave(newData, palette);
  };

  const handlePaletteChange = (newPalette: string) => {
    setPalette(newPalette);
    if (data) scheduleAutosave(data, newPalette);
  };

  const handleSaveNow = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (data) doSave(data, palette);
  };

  if (isLoading || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ color: "#94a3b8", fontSize: "13px" }}>Loading project...</div>
      </div>
    );
  }

  const pal = getPalette(palette);
  const saveLabel = saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "All changes saved" : "Unsaved changes";
  const saveColor = saveStatus === "saving" ? "#f59e0b" : saveStatus === "saved" ? "#22c55e" : "#ef4444";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
      {/* Collapsible sidebar */}
      <div style={{
        flexShrink: 0,
        width: sidebarCollapsed ? "0px" : "320px",
        overflow: "hidden",
        transition: "width 0.25s ease",
        borderRight: sidebarCollapsed ? "none" : "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
      }}>
        {!sidebarCollapsed && (
          <Sidebar
            data={data}
            palette={palette}
            onPaletteChange={handlePaletteChange}
            onChange={handleDataChange}
            onPrint={() => printCaseStudy()}
            onBack={() => navigate("/")}
            saved={saveStatus === "saved"}
            onSaveNow={handleSaveNow}
            editableMode={editableMode}
            onToggleEditable={() => setEditableMode((v) => !v)}
            projectName={project?.name ?? ""}
          />
        )}
      </div>

      {/* Preview area */}
      <div style={{ flex: 1, overflowY: "auto", background: "#dde3ea", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px", gap: "10px", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ width: "100%", maxWidth: "860px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Hamburger toggle */}
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              title={sidebarCollapsed ? "Show panel" : "Collapse panel"}
              style={{
                width: "32px", height: "32px", border: "none", borderRadius: "6px",
                background: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "#64748b",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "#666", fontWeight: 600 }}>OSMOS</div>
            <div style={{ width: "1px", height: "16px", background: "#ccc" }} />
            <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>Live Preview</span>
            {editableMode && (
              <span style={{ fontSize: "11px", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "20px", fontWeight: 600, border: "1px solid #fcd34d" }}>
                Click-to-edit ON
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: saveColor, fontWeight: 600 }}>{saveLabel}</span>
            <button
              onClick={() => printCaseStudy()}
              style={{
                background: pal.primary, color: "white", border: "none", borderRadius: "7px",
                padding: "7px 16px", fontSize: "12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px", fontWeight: 600,
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / Save PDF
            </button>
          </div>
        </div>

        <div style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.18)", width: "794px", flexShrink: 0 }}>
          <CaseStudyPreview data={data} palette={pal} editable={editableMode} onChange={handleDataChange} />
        </div>
      </div>
    </div>
  );
}
