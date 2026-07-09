import { Question, Section, ClientInfo } from '@/types/questionnaire';

export async function generatePdf(
  sectorName: string,
  clientInfo: ClientInfo,
  questions: Question[],
  sections: Section[],
  logoUrl: string
): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // Build a hidden printable div
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;background:#fff;font-family:Inter,Arial,sans-serif;font-size:10px;color:#1a1a1a;';

  const organizedData = sections
    .map((s) => ({ section: s, questions: questions.filter((q) => q.sectionId === s.id).sort((a, b) => a.number - b.number) }))
    .filter((g) => g.questions.length > 0);
  const unsectioned = questions.filter((q) => !q.sectionId).sort((a, b) => a.number - b.number);

  const questionHtml = (q: Question): string => {
    const answerArea = q.type === 'Number'
      ? '<div style="border-bottom:1px dashed #ccc;width:80px;margin-top:8px;height:16px;"></div>'
      : q.type === 'Table'
        ? `<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:9px;">
            <thead><tr style="background:#f0f5fb;">
              <th style="border:1px solid #ccc;padding:4px;text-align:left;">Parameter</th>
              <th style="border:1px solid #ccc;padding:4px;text-align:left;">Unit</th>
              <th style="border:1px solid #ccc;padding:4px;text-align:left;">Value</th>
            </tr></thead>
            <tbody>${[1,2,3].map(() => '<tr><td style="border:1px solid #ccc;padding:8px;"></td><td style="border:1px solid #ccc;padding:8px;"></td><td style="border:1px solid #ccc;padding:8px;"></td></tr>').join('')}</tbody>
           </table>`
        : '<div style="border-bottom:1px dashed #ccc;margin-top:8px;height:16px;"></div><div style="border-bottom:1px dashed #ccc;margin-top:8px;height:16px;"></div>';

    return `<div style="margin-bottom:16px;page-break-inside:avoid;">
      <p style="font-size:10px;font-weight:500;margin:0;"><strong>Q${q.number}.</strong> ${q.text}${q.required ? ' <span style="color:#e53e3e;">*</span>' : ''}</p>
      ${answerArea}
    </div>`;
  };

  container.innerHTML = `
    <div style="padding:32px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #003466;padding-bottom:16px;margin-bottom:24px;">
        <img src="${logoUrl}" style="height:40px;object-fit:contain;" />
        <div style="text-align:right;">
          <div style="font-size:14px;font-weight:700;color:#003466;letter-spacing:1px;">TECHNICAL QUESTIONNAIRE</div>
          <div style="font-size:10px;background:#e8f0fa;color:#003466;padding:3px 8px;margin-top:4px;border-radius:3px;display:inline-block;">${sectorName}</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:9px;margin-bottom:20px;">
        <tbody>
          <tr>
            <td style="width:20%;padding:6px;border:1px solid #ccc;background:#f0f5fb;font-weight:600;color:#003466;">Company Name</td>
            <td style="padding:6px;border:1px solid #ccc;">${clientInfo.companyName || '________________________________'}</td>
            <td style="width:15%;padding:6px;border:1px solid #ccc;background:#f0f5fb;font-weight:600;color:#003466;">Date</td>
            <td style="padding:6px;border:1px solid #ccc;">${clientInfo.date || '________________'}</td>
          </tr>
          <tr>
            <td style="padding:6px;border:1px solid #ccc;background:#f0f5fb;font-weight:600;color:#003466;">Contact Person</td>
            <td style="padding:6px;border:1px solid #ccc;">${clientInfo.contactPerson || '________________________________'}</td>
            <td style="padding:6px;border:1px solid #ccc;background:#f0f5fb;font-weight:600;color:#003466;">Location</td>
            <td style="padding:6px;border:1px solid #ccc;">${clientInfo.location || '________________'}</td>
          </tr>
        </tbody>
      </table>

      ${organizedData.map((g) => `
        <div style="margin-bottom:20px;page-break-inside:avoid;">
          <div style="background:#e8f0fa;border-left:4px solid #003466;padding:6px 10px;font-size:10px;font-weight:700;color:#003466;margin-bottom:12px;">${g.section.title.toUpperCase()}</div>
          ${g.questions.map(questionHtml).join('')}
        </div>
      `).join('')}

      ${unsectioned.length > 0 ? unsectioned.map(questionHtml).join('') : ''}
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    let posY = 0;
    let remaining = imgH;

    while (remaining > 0) {
      if (posY > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -posY, imgW, imgH);
      posY += pageH;
      remaining -= pageH;
    }

    const filename = `Permionics_${sectorName.replace(/\s+/g, '_')}_Questionnaire_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
