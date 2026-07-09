import { useState } from "react";
import { useLocation } from "wouter";
import { CaseStudyData, DEFAULT_DATA } from "@/types/case-study";
import { useCaseStudies } from "@/hooks/useCaseStudies";
import { CaseStudySidebar } from "@/components/case-study/CaseStudySidebar";
import { FullCaseStudyPreview } from "@/components/case-study/FullCaseStudyPreview";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateCaseStudy } from "@workspace/api-client-react";
import { Save, Loader2 } from "lucide-react";
import { printCaseStudy } from "@/utils/print";

export default function GeneratorPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [data, setData] = useState<CaseStudyData>(DEFAULT_DATA);
  const { saveStudy } = useCaseStudies();
  const [isSaving, setIsSaving] = useState(false);
  const createMutation = useCreateCaseStudy();

  const handleSaveDraft = () => {
    setIsSaving(true);
    try {
      saveStudy(data);
      toast({ title: "Draft Saved", description: "Saved locally to this browser." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToLibrary = () => {
    createMutation.mutate({
      data: {
        clientName: data.clientName,
        sector: data.sector,
        location: data.location,
        challenge: data.challengeProblem,
        solution: data.solDesign,
        technologyStack: data.techList.split("\n").filter(Boolean).join(", "),
        capacity: data.capacity,
        results: data.perfStab,
        testimonial: null,
        fullText: `${data.intro} ${data.challengeProblem} ${data.solDesign} ${data.perfStab} ${data.conclusions}`,
        tags: data.sector ? [data.sector] : [],
      },
    }, {
      onSuccess: (res) => {
        toast({ title: "Saved to Library", description: "Case study added to the shared library." });
        setLocation(`/library/${res.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save to library.", variant: "destructive" });
      },
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left: sidebar form */}
      <CaseStudySidebar
        data={data}
        onChange={setData}
        onPrint={printCaseStudy}
        onSave={handleSaveDraft}
        isSaving={isSaving}
      />

      {/* Right: scrollable preview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        {/* Preview header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b flex-shrink-0">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Live Preview</Badge>
          <Button
            size="sm"
            onClick={handleSaveToLibrary}
            disabled={createMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {createMutation.isPending
              ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              : <Save className="w-4 h-4 mr-2" />}
            Save to Library
          </Button>
        </div>

        {/* Scrollable preview area */}
        <ScrollArea className="flex-1">
          <div className="p-6 overflow-x-auto">
            <FullCaseStudyPreview data={data} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
