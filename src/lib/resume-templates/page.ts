/**
 * Shared A4 page + pagination rules for every resume skin.
 * Chromium print (Playwright) honors these; keep them aggressive so
 * section titles and job headers never sit alone at the bottom of a page.
 */
export const resumePageCss = /* css */ `
@page {
  size: A4;
  margin: 14mm 15mm 16mm;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.resume {
  width: 100%;
  max-width: 180mm;
  margin: 0 auto;
}

/* —— Pagination —— */
.resume h2 {
  break-after: avoid;
  page-break-after: avoid;
  break-inside: avoid;
  page-break-inside: avoid;
}

.resume .r-block-start {
  break-inside: avoid;
  page-break-inside: avoid;
  break-after: avoid;
  page-break-after: avoid;
}

.resume .r-job,
.resume .r-project {
  break-inside: avoid;
  page-break-inside: avoid;
}

.resume .r-summary,
.resume li,
.resume .r-skill {
  orphans: 3;
  widows: 3;
}

.resume section {
  break-inside: auto;
}

@media print {
  .resume {
    max-width: none;
    padding: 0 !important;
  }
}
`.trim();
