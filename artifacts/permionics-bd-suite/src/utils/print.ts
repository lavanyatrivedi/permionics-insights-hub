import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from '@/hooks/use-toast';

export async function printCaseStudy() {
  const element = document.getElementById('cs-root');
  if (!element) {
    toast({ title: "Error", description: "Could not find case study preview to export.", variant: "destructive" });
    return;
  }

  try {
    toast({ title: "Generating PDF...", description: "Please wait while we render the high-quality PDF." });

    // Temporarily adjust styles for perfect rendering
    const originalTransform = element.style.transform;
    element.style.transform = 'none';

    // Capture the element at high resolution (scale: 3 for crisp text)
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    element.style.transform = originalTransform;

    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // Set width to standard A4 width (210mm) and calculate height based on element aspect ratio
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF (A4 Portrait)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Page 1
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 594);

    // Page 2
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, -297, 210, 594);
    
    // Save the PDF
    pdf.save(`Permionics_Case_Study_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({ title: "Success", description: "PDF exported successfully." });
  } catch (error) {
    console.error("PDF Export Error:", error);
    toast({ title: "Export Failed", description: "An error occurred while generating the PDF.", variant: "destructive" });
  }
}
