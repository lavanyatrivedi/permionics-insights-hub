import { useState } from "react";
import { useLocation } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaseStudyPreview } from "@/components/case-study/CaseStudyPreview";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCaseStudy } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Save, Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";

const schema = z.object({
  clientName: z.string().min(1, "Client Name is required"),
  sector: z.string().min(1, "Sector is required"),
  location: z.string().min(1, "Location is required"),
  challenge: z.string().min(10, "Provide more detail on the challenge"),
  solution: z.string().min(10, "Provide more detail on the solution"),
  technologyStack: z.string().min(1, "Technology Stack is required"),
  capacity: z.string().min(1, "Capacity is required"),
  results: z.string().min(10, "Provide more detail on the results"),
  testimonial: z.string().optional(),
  tags: z.string().transform(val => val ? val.split(',').map(t => t.trim()).filter(Boolean) : [])
});

type FormValues = z.infer<typeof schema>;

export default function GeneratorPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateCaseStudy();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: "",
      sector: "",
      location: "",
      challenge: "",
      solution: "",
      technologyStack: "",
      capacity: "",
      results: "",
      testimonial: "",
      tags: [],
    }
  });

  const formData = form.watch();

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({ 
      data: {
        ...values,
        fullText: `${values.challenge} ${values.solution} ${values.results}`,
        testimonial: values.testimonial || null,
      } 
    }, {
      onSuccess: (res) => {
        toast({ title: "Case Study Saved", description: "Successfully added to the library." });
        setLocation(`/library/${res.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save case study.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b bg-card shrink-0 print-hide">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/library')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Case Study Generator</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save to Library
          </Button>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Form Pane */}
        <div className="w-1/2 border-r bg-muted/20 overflow-y-auto print-hide flex-shrink-0">
          <div className="p-8 max-w-2xl mx-auto">
            <Form {...form}>
              <form className="space-y-8 pb-16" id="generator-form">
                
                <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
                  <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                  
                  <FormField control={form.control} name="clientName" render={({ field }) => (
                    <FormItem><FormLabel>Client Name</FormLabel><FormControl><Input placeholder="e.g. Waaree Energies" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="sector" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Pharma/Herbal">Pharma/Herbal</SelectItem>
                            <SelectItem value="Textile">Textile</SelectItem>
                            <SelectItem value="CETP/Municipal">CETP/Municipal</SelectItem>
                            <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                            <SelectItem value="Chemical/Industrial">Chemical/Industrial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g. Vapi, Gujarat" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>

                <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
                  <h3 className="text-lg font-semibold border-b pb-2">Technical Specifications</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="technologyStack" render={({ field }) => (
                      <FormItem><FormLabel>Technology Stack</FormLabel><FormControl><Input placeholder="e.g. UF + RO + MBR" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <FormField control={form.control} name="capacity" render={({ field }) => (
                      <FormItem><FormLabel>Capacity</FormLabel><FormControl><Input placeholder="e.g. 500 KLD" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>

                <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
                  <h3 className="text-lg font-semibold border-b pb-2">Narrative</h3>
                  
                  <FormField control={form.control} name="challenge" render={({ field }) => (
                    <FormItem><FormLabel>The Challenge</FormLabel><FormControl><Textarea className="min-h-[100px]" placeholder="Describe the inlet water quality and client constraints..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="solution" render={({ field }) => (
                    <FormItem><FormLabel>Our Solution</FormLabel><FormControl><Textarea className="min-h-[120px]" placeholder="Describe Permionics' technological approach..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="results" render={({ field }) => (
                    <FormItem><FormLabel>Results & Impact</FormLabel><FormControl><Textarea className="min-h-[100px]" placeholder="Key metrics, recovery rate, OPEX savings..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
                  <h3 className="text-lg font-semibold border-b pb-2">Additional</h3>
                  
                  <FormField control={form.control} name="testimonial" render={({ field }) => (
                    <FormItem><FormLabel>Client Testimonial (Optional)</FormLabel><FormControl><Textarea placeholder="Quote from the client..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  {/* using a standard input for tags to simulate z.string().transform behavior for demo purposes */}
                  <FormItem>
                    <FormLabel>Tags (Comma separated)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ZLD, High COD, Fast Execution..." 
                        onChange={(e) => {
                          const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          form.setValue("tags", val as any);
                        }} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Right Preview Pane */}
        <div className="w-1/2 bg-gray-100 overflow-y-auto p-8 print-full flex-shrink-0">
          <div className="max-w-[850px] mx-auto">
            <div className="mb-4 print-hide">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Live Preview</Badge>
            </div>
            {/* 
              Pass formData but coerce tags back to array if it is not 
            */}
            <CaseStudyPreview data={{
              ...formData,
              tags: Array.isArray(formData.tags) ? formData.tags : []
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
