import { useParams, Link } from "wouter";
import { useGetCaseStudy, getGetCaseStudyQueryKey } from "@workspace/api-client-react";
import { CaseStudyPreview } from "@/components/case-study/CaseStudyPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Download, Loader2 } from "lucide-react";

export default function CaseStudyDetail() {
  const { id } = useParams();
  const numId = id ? parseInt(id, 10) : 0;
  
  const { data, isLoading } = useGetCaseStudy(numId, {
    query: {
      enabled: !!numId,
      queryKey: getGetCaseStudyQueryKey(numId)
    }
  });

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

  return (
    <div className="max-w-[1000px] mx-auto p-8 space-y-6 print-full print:p-0">
      <div className="flex items-center justify-between print-hide mb-8">
        <Link href="/library" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
        </Link>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => window.print()} className="bg-background">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button variant="secondary" className="bg-secondary text-secondary-foreground" disabled>
            <Edit className="w-4 h-4 mr-2" /> Edit Case Study
          </Button>
        </div>
      </div>
      
      <div className="print-full pb-16">
        <CaseStudyPreview data={data} />
      </div>
    </div>
  );
}
