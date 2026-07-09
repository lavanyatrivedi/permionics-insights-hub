import React from 'react';
import { Question, Section, ClientInfo } from '@/types/questionnaire';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, Download } from 'lucide-react';
import logoUrl from '@assets/logo-01_(1)_1783575156427.png';

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectorName: string;
  clientInfo: ClientInfo;
  questions: Question[];
  sections: Section[];
}

export function PreviewModal({ open, onOpenChange, sectorName, clientInfo, questions, sections }: PreviewModalProps) {
  const handleExport = async () => {
    try {
      const { generatePdf } = await import('./PdfExport');
      await generatePdf(sectorName, clientInfo, questions, sections, logoUrl);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  const organizedData = sections.map((section) => ({
    section,
    questions: questions.filter((q) => q.sectionId === section.id).sort((a, b) => a.number - b.number),
  })).filter((g) => g.questions.length > 0);

  const unsectioned = questions.filter((q) => !q.sectionId).sort((a, b) => a.number - b.number);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] h-full flex flex-col p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 border-b border-border bg-secondary/30 flex-shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-medium text-primary">Preview: {sectorName} Questionnaire</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button size="sm" onClick={handleExport} className="bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 font-sans bg-white">
          <div className="max-w-3xl mx-auto space-y-8 pb-10">

            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-primary pb-4 mb-6">
              <img src={logoUrl} alt="Permionics" className="h-12 object-contain" />
              <div className="text-right">
                <h1 className="text-xl font-bold text-primary tracking-tight">TECHNICAL QUESTIONNAIRE</h1>
                <div className="text-sm font-medium text-muted-foreground mt-1 px-2 py-0.5 bg-secondary inline-block rounded">{sectorName}</div>
              </div>
            </div>

            {/* Client Info */}
            <table className="w-full border-collapse border border-border text-sm mb-8">
              <tbody>
                <tr>
                  <td className="w-1/4 p-2 border border-border bg-secondary/40 font-semibold text-primary">Company Name</td>
                  <td className="p-2 border border-border font-medium text-foreground">{clientInfo.companyName || '_________________________________'}</td>
                  <td className="w-1/4 p-2 border border-border bg-secondary/40 font-semibold text-primary">Date</td>
                  <td className="p-2 border border-border text-foreground">{clientInfo.date || '____________________'}</td>
                </tr>
                <tr>
                  <td className="w-1/4 p-2 border border-border bg-secondary/40 font-semibold text-primary">Contact Person</td>
                  <td className="p-2 border border-border text-foreground">{clientInfo.contactPerson || '_________________________________'}</td>
                  <td className="w-1/4 p-2 border border-border bg-secondary/40 font-semibold text-primary">Location</td>
                  <td className="p-2 border border-border text-foreground">{clientInfo.location || '____________________'}</td>
                </tr>
              </tbody>
            </table>

            <p className="text-sm text-muted-foreground italic mb-6">
              Please provide as much detail as possible to help us design the optimal membrane solution for your application.
            </p>

            {/* Questions by section */}
            <div className="space-y-8">
              {organizedData.map((group) => (
                <div key={group.section.id} className="space-y-4 break-inside-avoid">
                  <h2 className="text-base font-bold text-primary bg-secondary/30 px-3 py-1.5 border-l-4 border-primary">
                    {group.section.title.toUpperCase()}
                  </h2>
                  <div className="space-y-6">
                    {group.questions.map((q) => (
                      <div key={q.id} className="break-inside-avoid">
                        <div className="flex gap-2">
                          <span className="font-semibold text-foreground min-w-[24px]">Q{q.number}.</span>
                          <div className="flex-1 space-y-2">
                            <p className="text-foreground text-sm font-medium">
                              {q.text}{q.required && <span className="text-destructive ml-1">*</span>}
                            </p>
                            {q.type === 'Text' && (
                              <div className="space-y-6 pt-2">
                                <div className="border-b border-dashed border-border/70 w-full" />
                                <div className="border-b border-dashed border-border/70 w-full" />
                              </div>
                            )}
                            {q.type === 'Number' && <div className="pt-2"><div className="border-b border-dashed border-border/70 w-32" /></div>}
                            {q.type === 'Choice' && (
                              <div className="flex items-center gap-4 pt-2 flex-wrap">
                                {[1, 2, 3, 4].map((i) => (
                                  <div key={i} className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full border border-muted-foreground/50" />
                                    <div className="border-b border-dashed border-border/70 w-16" />
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.type === 'Table' && (
                              <div className="pt-2">
                                <table className="w-full border-collapse border border-border text-sm">
                                  <thead>
                                    <tr className="bg-secondary/20">
                                      <th className="border border-border p-2 text-left font-medium text-muted-foreground">Parameter</th>
                                      <th className="border border-border p-2 text-left font-medium text-muted-foreground">Unit</th>
                                      <th className="border border-border p-2 text-left font-medium text-muted-foreground">Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[1, 2, 3].map((row) => (
                                      <tr key={row}><td className="border border-border p-3 h-8" /><td className="border border-border p-3 h-8" /><td className="border border-border p-3 h-8" /></tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {unsectioned.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-border mt-8">
                  {unsectioned.map((q) => (
                    <div key={q.id} className="flex gap-2 break-inside-avoid">
                      <span className="font-semibold text-foreground min-w-[24px]">Q{q.number}.</span>
                      <div className="flex-1 space-y-2">
                        <p className="text-foreground text-sm font-medium">{q.text}{q.required && <span className="text-destructive ml-1">*</span>}</p>
                        <div className="space-y-6 pt-2">
                          <div className="border-b border-dashed border-border/70 w-full" />
                          <div className="border-b border-dashed border-border/70 w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
