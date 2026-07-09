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

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const canvasW = canvas.width;
    const canvasH = canvas.height;

    // Scale image to fit A4 with no margins (full bleed)
    const scaleX = A4_W / (canvasW / 2);  // divide by scale factor
    const scaleY = A4_H / (canvasH / 2);
    const scale = Math.min(scaleX, scaleY);

    const imgW = (canvasW / 2) * scale;
    const imgH = (canvasH / 2) * scale;

    // Centre on page
    const offsetX = (A4_W - imgW) / 2;
    const offsetY = (A4_H - imgH) / 2;

    pdf.addImage(imgData, "JPEG", offsetX, offsetY, imgW, imgH);
    pdf.save(`Permionics_CaseStudy_${Date.now()}.pdf`);
  } catch (err) {
    document.body.style.overflow = originalOverflow;
    console.error("PDF export failed:", err);
    alert("PDF export failed. Please try again.");
  }
}
