import { useParams, Link, useLocation } from "wouter";
import { useGetCaseStudy, getGetCaseStudyQueryKey, useDeleteCaseStudy } from "@workspace/api-client-react";
import { CaseStudyPreview } from "../generator/creator_components/CaseStudyPreview";
import { getPalette } from "../generator/creator_types";
import { printCaseStudy } from "../generator/creator_utils/print";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Download, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CaseStudyDetail() {
  const { id } = useParams();
  const numId = id ? parseInt(id, 10) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { data, isLoading } = useGetCaseStudy(numId, {
    query: {
      enabled: !!numId,
      queryKey: getGetCaseStudyQueryKey(numId)
    }
  });

  const deleteMutation = useDeleteCaseStudy();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: numId });
      toast({ title: "Deleted", description: "Case study deleted from library." });
      setLocation("/library");
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err?.message || "Failed to delete case study.", 
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold">Case Study Not Found</h2>
        <Link href="/library">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Library</Button>
        </Link>
      </div>
    );
  }

  const mappedData = {
    clientName: data.clientName || "",
    sector: data.sector || "",
    location: data.location || "",
    intro: data.fullText ? data.fullText.split("\n\n")[0] || "" : "",
    challengeProblem: data.challenge || "",
    solDesign: data.solution || "",
    techList: data.technologyStack || "",
    capacity: data.capacity || "",
    cards: data.results ? data.results.split(" | ").map((cardStr) => {
      const idx = cardStr.indexOf(":");
      if (idx !== -1) {
        return { number: cardStr.slice(0, idx).trim(), label: cardStr.slice(idx + 1).trim() };
      }
      return { number: "", label: cardStr.trim() };
    }) : [],
    handshakeCap: data.testimonial || "",
    conclusions: data.fullText ? data.fullText.split("\n\n").slice(-1)[0] || "" : "",
  };

  return (
    <div className="max-w-[1000px] mx-auto p-8 space-y-6 print-full print:p-0 animate-fade-in">
      <div className="flex items-center justify-between print-hide mb-8">
        <Link href="/library" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => printCaseStudy()} className="bg-background">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button variant="secondary" className="bg-secondary text-secondary-foreground" disabled>
            <Edit className="w-4 h-4 mr-2" /> Edit Case Study
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-white">
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Case Study?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete "{data.clientName}" from the library? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="print-full pb-16 flex justify-center bg-slate-50 border rounded-2xl p-6 md:p-12 overflow-x-auto">
        <div style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.12)", width: "794px", flexShrink: 0, background: "#ffffff" }}>
          <CaseStudyPreview data={mappedData} palette={getPalette("ocean-blue")} />
        </div>
      </div>
    </div>
  );
}
