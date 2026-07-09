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

    // Create PDF (A4 Portrait)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // If the image is taller than the A4 page, we can either:
    // 1. Scale it down to fit on one page
    // 2. Let it span multiple pages
    // The user explicitly wanted a 1-page layout, so we'll scale it to fit 
    // IF it's only slightly taller, otherwise it might become unreadable.
    // For a highly dense 1-pager, scaling is usually preferred.
    
    let finalWidth = imgWidth;
    let finalHeight = imgHeight;
    
    // Scale to fit vertically if needed
    if (imgHeight > pageHeight) {
      const ratio = pageHeight / imgHeight;
      finalWidth = imgWidth * ratio;
      finalHeight = pageHeight;
    }

    // Center horizontally if scaled down
    const marginX = (pageWidth - finalWidth) / 2;
    const marginY = 0; // Top aligned

    pdf.addImage(imgData, 'JPEG', marginX, marginY, finalWidth, finalHeight);
    
    // Save the PDF
    pdf.save(`Permionics_Case_Study_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({ title: "Success", description: "PDF exported successfully." });
  } catch (error) {
    console.error("PDF Export Error:", error);
    toast({ title: "Export Failed", description: "An error occurred while generating the PDF.", variant: "destructive" });
  }
}
