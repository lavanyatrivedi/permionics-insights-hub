/**
 * Captures the #cs-root element as a high-quality PDF using html2canvas + jsPDF.
 * Outputs a clean A4 single-page PDF with proper margins.
 */
export async function printCaseStudy() {
  const el = document.getElementById("cs-root");
  if (!el) {
    console.error("cs-root element not found");
    return;
  }

  // Dynamically import to avoid SSR issues
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Temporarily ensure the element is not clipped for capture
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = "visible";

  try {
    const canvas = await html2canvas(el, {
      scale: 2,              // 2x for crisp print quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: el.scrollWidth,
      height: el.scrollHeight,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });

    document.body.style.overflow = originalOverflow;

    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    // A4 dimensions in mm
    const A4_W = 210;
    const A4_H = 297;

    const canvasW = canvas.width;
    const canvasH = canvas.height;

    // Since we restructured the template to have exactly two A4 pages stacked,
    // we draw page 1 on PDF page 1, and page 2 on PDF page 2.
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Page 1
    // A4 is 210mm wide x 297mm high. Total height of 2 pages at this aspect ratio is 594mm.
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 594);

    // Page 2
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, -297, 210, 594);

    pdf.save(`Permionics_CaseStudy_${Date.now()}.pdf`);
  } catch (err) {
    document.body.style.overflow = originalOverflow;
    console.error("PDF export failed:", err);
    alert("PDF export failed. Please try again.");
  }
}
