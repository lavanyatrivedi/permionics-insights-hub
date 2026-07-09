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
  const [saved, setSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    customFetch(`/api/case-studies/${projectId}`)
      .then((res: any) => {
        setProject(res);
        setData(res.data as unknown as CaseStudyData);
        setPalette(res.palette);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [projectId]);

  const autosave = useCallback((newData: CaseStudyData, newPalette: string) => {
    setSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setIsSaving(true);
      customFetch(`/api/case-studies/${projectId}`, {
        method: "PUT",
        body: JSON.stringify({ data: newData, palette: newPalette }),
      }).then(() => {
        setSaved(true);
        setIsSaving(false);
      }).catch(console.error);
    }, 1200);
  }, [projectId]);

  const handleDataChange = (newData: CaseStudyData) => {
    setData(newData);
    autosave(newData, palette);
  };

  const handlePaletteChange = (newPalette: string) => {
    setPalette(newPalette);
    if (data) autosave(data, newPalette);
  };

  const handleSaveNow = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (data) {
      setIsSaving(true);
      customFetch(`/api/case-studies/${projectId}`, {
        method: "PUT",
        body: JSON.stringify({ data, palette }),
      }).then(() => {
        setSaved(true);
        setIsSaving(false);
      }).catch(console.error);
    }
  };

  if (isLoading || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ color: "#94a3b8", fontSize: "13px" }}>Loading project...</div>
      </div>
    );
  }

  const pal = getPalette(palette);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ flexShrink: 0, borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Sidebar
          data={data}
          palette={palette}
          onPaletteChange={handlePaletteChange}
          onChange={handleDataChange}
          onPrint={() => printCaseStudy()}
          onBack={() => navigate("/")}
          saved={saved}
          onSaveNow={handleSaveNow}
          editableMode={editableMode}
          onToggleEditable={() => setEditableMode((v) => !v)}
          projectName={project?.name ?? ""}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "#dde3ea", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 14px", gap: "10px" }}>
        <div style={{ width: "100%", maxWidth: "794px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "#666", fontWeight: 600 }}>OSMOS</div>
            <div style={{ width: "1px", height: "18px", background: "#ccc" }} />
            <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>Live Preview — updates as you type</span>
            {editableMode && (
              <span style={{ fontSize: "11px", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "20px", fontWeight: 600, border: "1px solid #fcd34d" }}>
                Click-to-edit ON
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: saved ? "#22c55e" : "#f59e0b", fontWeight: 500 }}>
              {isSaving ? "Saving..." : saved ? "Saved" : "Unsaved changes"}
            </span>
            <button
              onClick={() => printCaseStudy()}
              style={{ background: pal.primary, color: "white", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / Save PDF
            </button>
          </div>
        </div>

        <div style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.18)", width: "794px" }}>
          <CaseStudyPreview data={data} palette={pal} editable={editableMode} onChange={handleDataChange} />
        </div>
      </div>
    </div>
  );
}
