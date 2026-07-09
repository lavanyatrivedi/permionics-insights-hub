import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Printer, CheckCircle2, Save, FileText, ClipboardList } from "lucide-react";
import { useCreateQuestionnaire, useListQuestionnaires } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Sector predefined questions
const SECTOR_QUESTIONS: Record<string, string[]> = {
  "Pharma/Herbal": [
    "Water source and current quality parameters (TDS, pH, conductivity)?",
    "Daily/hourly flow rate requirement (m3/day)?",
    "Current treatment method in place?",
    "Regulated contaminants of concern (endotoxins, heavy metals, microbial)?",
    "Required output water quality standard (USP, IP, WHO-GMP)?",
    "Budget range and project timeline?",
    "Plant location and utility availability (power, compressed air)?",
    "Compliance certifications required?"
  ],
  "Textile": [
    "Effluent volume generated per day (KLD)?",
    "Current COD/BOD/TDS levels in effluent?",
    "Color and dye load in wastewater?",
    "Existing primary treatment in place?",
    "ZLD requirement — yes/no? Target reuse percentage?",
    "Type of dyes/chemicals used?",
    "Available land area for plant?",
    "Timeline and budget range?"
  ],
  "CETP/Municipal": [
    "Total design capacity required (MLD)?",
    "Number of member industries and their sectors?",
    "Current inlet quality parameters (COD, BOD, TSS, TDS)?",
    "Effluent discharge standard to comply with (CPCB, state PCB)?",
    "Existing infrastructure available?",
    "Land availability and site constraints?",
    "Operating budget and STP/ETP operator availability?",
    "Future expansion provisions needed?"
  ],
  "Food & Beverage": [
    "Type of F&B process (dairy, beverages, brewing, packaged food)?",
    "Process water requirement vs. effluent treatment need?",
    "Key contaminants (BOD, fats/oils/grease, sugars, salts)?",
    "Current treatment method?",
    "Recovery percentage target for water reuse?",
    "Seasonal variation in production and effluent volume?",
    "Food-grade membrane requirement?",
    "Regulatory compliance requirements?"
  ]
};

export default function QuestionnairePage() {
  const [activeSector, setActiveSector] = useState("Pharma/Herbal");
  const [clientName, setClientName] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [additionalQuestions, setAdditionalQuestions] = useState<string[]>([]);
  
  const { toast } = useToast();
  const createMutation = useCreateQuestionnaire();
  const { data: savedQuestionnaires, refetch } = useListQuestionnaires();

  const handleAddQuestion = () => {
    if (customQuestion.trim()) {
      setAdditionalQuestions([...additionalQuestions, customQuestion.trim()]);
      setCustomQuestion("");
    }
  };

  const handleSave = () => {
    if (!clientName.trim()) {
      toast({ title: "Client Name Required", description: "Please enter a client name to save.", variant: "destructive" });
      return;
    }

    const allQuestions = [
      ...(SECTOR_QUESTIONS[activeSector] || []),
      ...additionalQuestions
    ];

    const questionsPayload = allQuestions.map((q, i) => ({
      id: `q-${i}`,
      question: q,
      type: "text"
    }));

    createMutation.mutate({
      data: {
        clientName,
        sector: activeSector,
        questions: questionsPayload,
        answers: {},
        notes: null
      }
    }, {
      onSuccess: () => {
        toast({ title: "Saved Successfully", description: "Questionnaire added to your saved list." });
        setClientName("");
        setAdditionalQuestions([]);
        refetch();
      }
    });
  };

  const currentQuestions = [...(SECTOR_QUESTIONS[activeSector] || []), ...additionalQuestions];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 print-full">
      <div className="flex items-center justify-between print-hide">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Questionnaire Builder</h1>
          <p className="text-muted-foreground mt-1">Generate sector-specific requirements gathering forms.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Left Side: Builder (hidden when printing) */}
        <div className="md:col-span-4 space-y-6 print-hide">
          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Client / Project Name</Label>
                  <Input 
                    placeholder="Enter client name..." 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sector Selection</CardTitle>
              <CardDescription>Select a sector to load standard questions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeSector} onValueChange={(v) => { setActiveSector(v); setAdditionalQuestions([]); }} orientation="vertical" className="w-full border-t">
                <TabsList className="flex flex-col h-auto bg-transparent p-0 rounded-none w-full">
                  {Object.keys(SECTOR_QUESTIONS).map((sector) => (
                    <TabsTrigger 
                      key={sector} 
                      value={sector}
                      className="w-full justify-start rounded-none border-b px-6 py-4 data-[state=active]:bg-primary/5 data-[state=active]:border-r-4 data-[state=active]:border-r-primary data-[state=active]:shadow-none font-medium"
                    >
                      {sector}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" /> Generate Printable Form
              </Button>
              <Button variant="secondary" className="w-full" onClick={handleSave} disabled={createMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> Save to System
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Preview / Print View */}
        <div className="md:col-span-8">
          <Card className="print:shadow-none print:border-none print:w-full">
            <CardHeader className="bg-primary text-primary-foreground rounded-t-xl print:bg-transparent print:text-black print:border-b-2 print:border-primary print:rounded-none">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl print:text-3xl">Technical Requirements Gathering</CardTitle>
                  <CardDescription className="text-primary-foreground/80 print:text-gray-600 mt-2 text-base">
                    {clientName ? `Client: ${clientName}` : "Client: ___________________________"}
                  </CardDescription>
                </div>
                <Badge className="bg-white text-primary border-none print:border-2 print:border-primary print:text-primary text-sm px-3 py-1">
                  {activeSector}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-8">
                {currentQuestions.map((q, index) => (
                  <div key={index} className="space-y-3 border-b border-dashed pb-6 print:border-gray-300">
                    <p className="font-medium text-foreground flex gap-3">
                      <span className="text-primary font-bold">{index + 1}.</span> {q}
                    </p>
                    {/* The blank lines for filling out on paper */}
                    <div className="h-6 border-b border-gray-200 print:border-gray-400"></div>
                    <div className="h-6 border-b border-gray-200 print:border-gray-400 hidden print:block"></div>
                  </div>
                ))}
              </div>

              {/* Add Custom Question (Hidden on Print) */}
              <div className="pt-6 print-hide">
                <div className="flex gap-3">
                  <Input 
                    placeholder="Type a custom question to add..." 
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                  />
                  <Button variant="outline" onClick={handleAddQuestion}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Questionnaires */}
      <div className="pt-12 print-hide border-t mt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Saved Questionnaires
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {savedQuestionnaires && savedQuestionnaires.length > 0 ? (
            savedQuestionnaires.map((q) => (
              <Card key={q.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{q.clientName}</CardTitle>
                    <Badge variant="secondary">{q.sector}</Badge>
                  </div>
                  <CardDescription>
                    Created {format(new Date(q.createdAt), "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    {q.questions.length} questions
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-muted/20 rounded-xl border border-dashed">
              <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No saved questionnaires yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
