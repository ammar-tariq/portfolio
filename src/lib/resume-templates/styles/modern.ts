/**
 * Modern — contemporary single-column CV.
 *
 * Design intent: clean product-engineering look. Left-aligned name (title case),
 * slate-teal accent on section titles with a short underline (not a full rule),
 * open leading, and a thin left accent bar on the header. Still one column —
 * no sidebars, icons, skill bars, or purple gradients.
 *
 * After editing, run `npm run resume-previews` to refresh public HTML/CSS previews.
 */
export const modernCss = /* css */ `
@page { margin: 0.55in 0.6in; }
* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  color: #12141a;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.resume {
  --accent: #1e4a5c;
  --ink: #12141a;
  --muted: #5a5f6a;
  font-family: "Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif;
  font-size: 10.25pt;
  line-height: 1.42;
  max-width: 7.5in;
  margin: 0 auto;
  padding: 0.38in 0.18in 0.42in;
  color: var(--ink);
}
.resume a { color: inherit; text-decoration: none; }

/* —— Header —— */
.resume .r-head {
  text-align: left;
  padding: 2pt 0 14pt 14pt;
  margin: 0 0 6pt;
  border-left: 3.5pt solid var(--accent);
  border-bottom: none;
}
.resume .r-head h1 {
  margin: 0 0 4pt;
  font-size: 22pt;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.05;
  text-transform: none;
  color: var(--ink);
}
.resume .r-title {
  margin: 0;
  font-size: 11pt;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--accent);
}
.resume .r-place {
  margin: 3pt 0 9pt;
  font-size: 9pt;
  color: var(--muted);
  letter-spacing: 0.01em;
}
.resume .r-contact {
  margin: 0;
  font-size: 8.75pt;
  line-height: 1.5;
  color: var(--ink);
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0;
  row-gap: 3pt;
}
.resume .r-contact span {
  white-space: nowrap;
}
.resume .r-contact span + span::before {
  content: "";
  display: inline-block;
  width: 3pt;
  height: 3pt;
  margin: 0 8pt;
  border-radius: 50%;
  background: var(--accent);
  vertical-align: middle;
  opacity: 0.55;
}

/* —— Sections —— */
.resume section {
  margin: 0;
  padding: 0;
}
.resume h2 {
  margin: 15pt 0 8pt;
  padding: 0 0 5pt;
  font-size: 8.5pt;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  border-bottom: none;
  line-height: 1.2;
  position: relative;
}
.resume h2::after {
  content: "";
  display: block;
  width: 28pt;
  height: 1.75pt;
  margin-top: 5pt;
  background: var(--accent);
  border-radius: 1pt;
}
.resume .r-summary {
  margin: 0;
  font-size: 10pt;
  line-height: 1.48;
  color: #1c1f26;
  max-width: 95%;
}

/* —— Experience / Projects —— */
.resume .r-job,
.resume .r-project {
  margin: 0 0 11pt;
  padding-left: 0;
  page-break-inside: avoid;
  break-inside: avoid;
}
.resume .r-job:last-child,
.resume .r-project:last-child {
  margin-bottom: 0;
}
.resume .r-job-top,
.resume .r-project-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 14pt;
  margin: 0;
}
.resume .r-job-top h3,
.resume .r-project-top h3 {
  margin: 0;
  font-size: 10.75pt;
  font-weight: 700;
  line-height: 1.25;
  color: var(--ink);
  flex: 1 1 auto;
  letter-spacing: -0.01em;
}
.resume .r-dates {
  margin: 0;
  font-size: 9pt;
  font-weight: 500;
  color: var(--accent);
  white-space: nowrap;
  flex: 0 0 auto;
  letter-spacing: 0.01em;
}
.resume .r-org {
  margin: 2pt 0 4pt;
  font-size: 9.5pt;
  font-weight: 400;
  color: var(--muted);
  line-height: 1.3;
}
.resume .r-line {
  margin: 2pt 0 4pt;
  font-size: 9.5pt;
  color: var(--muted);
  line-height: 1.38;
}
.resume ul {
  margin: 0;
  padding: 0 0 0 13pt;
  list-style: disc;
}
.resume li {
  margin: 0 0 3pt;
  padding: 0;
  font-size: 9.75pt;
  line-height: 1.4;
  color: #1a1d24;
}
.resume li::marker {
  color: var(--accent);
}
.resume li:last-child {
  margin-bottom: 0;
}

/* —— Skills —— */
.resume .r-skill {
  margin: 0 0 4pt;
  font-size: 9.75pt;
  line-height: 1.4;
  color: #1a1d24;
}
.resume .r-skill:last-child {
  margin-bottom: 0;
}
.resume .r-skill strong {
  font-weight: 700;
  color: var(--accent);
  display: inline-block;
  min-width: 5em;
  margin-right: 6pt;
}

@media print {
  .resume { padding: 0; max-width: none; }
  .resume .r-job,
  .resume .r-project { page-break-inside: avoid; break-inside: avoid; }
}
`.trim();
