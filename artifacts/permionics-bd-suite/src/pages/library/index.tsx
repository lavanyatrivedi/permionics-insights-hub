import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListCaseStudies } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getSectorColor } from "@/components/case-study/CaseStudyPreview";
import { Search, Plus, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [technology, setTechnology] = useState("all");
  const [, setLocation] = useLocation();

  const { data: caseStudies, isLoading } = useListCaseStudies({
    search: search || undefined,
    sector: sector !== "all" ? sector : undefined,
    technology: technology !== "all" ? technology : undefined,
  });

  const formatDate = (dateStr?: string) => {
    try {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      return format(d, 'MMM d, yyyy');
    } catch {
      return "-";
    }
  };

  const safeCaseStudies = Array.isArray(caseStudies) ? caseStudies : [];

  return (
    <div className="p-8 pt-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Case Study Library</h1>
        <Button onClick={() => setLocation("/generator")}>
          <Plus className="w-4 h-4 mr-2" /> Add New
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl border shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search clients, keywords, tags..." 
            className="pl-9 h-10 w-full bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="w-full lg:w-[200px] h-10 bg-background">
              <SelectValue placeholder="Filter by Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="Pharma/Herbal">Pharma/Herbal</SelectItem>
              <SelectItem value="Textile">Textile</SelectItem>
              <SelectItem value="CETP/Municipal">CETP/Municipal</SelectItem>
              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
            </SelectContent>
          </Select>
          <Select value={technology} onValueChange={setTechnology}>
            <SelectTrigger className="w-full lg:w-[200px] h-10 bg-background">
              <SelectValue placeholder="Filter by Tech" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technologies</SelectItem>
              <SelectItem value="RO">RO</SelectItem>
              <SelectItem value="UF">UF</SelectItem>
              <SelectItem value="NF">NF</SelectItem>
              <SelectItem value="ZLD">ZLD</SelectItem>
              <SelectItem value="MBR">MBR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px] py-4">Client Name</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Technology</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right pr-6">Date Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                  </TableCell>
                </TableRow>
              ) : safeCaseStudies.length > 0 ? (
                safeCaseStudies.map((cs) => (
                  <TableRow 
                    key={cs.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setLocation(`/library/${cs.id}`)}
                  >
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        {cs.clientName || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getSectorColor(cs.sector || "")} whitespace-nowrap`}>
                        {cs.sector || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent shadow-none">
                        {cs.technologyStack || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cs.capacity || "-"}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm pr-6">
                      {formatDate(cs.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-muted-foreground/50" />
                      <p>No case studies found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
