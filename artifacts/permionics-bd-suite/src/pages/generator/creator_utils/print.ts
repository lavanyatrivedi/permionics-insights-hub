export async function printCaseStudy(logoDataUrl?: string) {
  const el = document.getElementById("cs-root");
  if (!el) return;

  let fullHtml = el.outerHTML;

  if (logoDataUrl) {
    fullHtml = fullHtml.replace(
      /(<img[^>]*id="cs-logo"[^>]*src=")[^"]*(")/,
      `$1${logoDataUrl}$2`
    );
  }

  const breakMarker = 'class="cs-page-break"';
  const splitIdx = fullHtml.indexOf(breakMarker);

  let page1Html: string;
  let page2Html: string;

  if (splitIdx === -1) {
    page1Html = fullHtml;
    page2Html = "";
  } else {
    let openTag = splitIdx;
    while (openTag > 0 && fullHtml[openTag] !== "<") openTag--;
    let closeTag = splitIdx;
    while (closeTag < fullHtml.length && fullHtml[closeTag] !== ">") closeTag++;
    const outerOpen =
      '<div id="cs-root" style="font-family:\'Open Sans\',Arial,sans-serif;font-size:9pt;color:#1a1a1a;background:#fff;width:794px;margin:0 auto;">';
    const outerClose = "</div>";
    page1Html = outerOpen + fullHtml.slice(fullHtml.indexOf(">") + 1, openTag) + outerClose;
    page2Html = outerOpen + fullHtml.slice(closeTag + 1, fullHtml.lastIndexOf("</div>")) + outerClose;
  }

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site and try again.");
    return;
  }

  const ZOOM = 0.82;
  const PAGE_H = 1123;

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Permionics Case Study</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; }
    .cs-page { width: 794px; height: ${PAGE_H}px; overflow: hidden; position: relative; }
    .cs-inner { transform-origin: top left; transform: scale(${ZOOM}); width: ${Math.round(794 / ZOOM)}px; }
    @page { size: A4 portrait; margin: 0; }
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .cs-page { width: 210mm; height: 297mm; overflow: hidden; page-break-after: always; break-after: page; }
      .cs-page:last-child { page-break-after: auto; break-after: auto; }
      .cs-inner { transform-origin: top left; transform: scale(${ZOOM}); width: ${Math.round(100 / ZOOM)}%; }
    }
  </style>
</head>
<body>
  <div class="cs-page"><div class="cs-inner">${page1Html}</div></div>
  ${page2Html ? `<div class="cs-page"><div class="cs-inner">${page2Html}</div></div>` : ""}
</body>
</html>`);
  win.document.close();

  await new Promise<void>((resolve) => {
    const imgs = Array.from(win.document.querySelectorAll("img"));
    if (imgs.length === 0) { resolve(); return; }
    let loaded = 0;
    const done = () => { if (++loaded >= imgs.length) resolve(); };
    imgs.forEach((img) => {
      if ((img as HTMLImageElement).complete) done();
      else { img.onload = done; img.onerror = done; }
    });
    setTimeout(resolve, 2500);
  });

  win.focus();
  win.print();
}
