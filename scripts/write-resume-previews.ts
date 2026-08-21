import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { classicCss } from "../src/lib/resume-templates/styles/classic";
import { compactCss } from "../src/lib/resume-templates/styles/compact";
import { executiveCss } from "../src/lib/resume-templates/styles/executive";
import { modernCss } from "../src/lib/resume-templates/styles/modern";
import { SAMPLE_RESUME_BODY } from "../src/lib/resume-templates/sample-body";
import { RESUME_TEMPLATES } from "../src/lib/resume-templates/registry";
import type { ResumeTemplateId } from "../src/lib/resume-templates/types";

const OUT = join(process.cwd(), "public", "resume-templates");

const STYLES: Record<ResumeTemplateId, string> = {
  classic: classicCss,
  executive: executiveCss,
  compact: compactCss,
  modern: modernCss,
};

const screenChrome = /* css */ `
@media screen {
  html { background: #d8d8dc; }
  body {
    margin: 0;
    min-height: 100vh;
    padding: 28px 16px 48px;
  }
  .preview-bar {
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    max-width: 7.6in;
    margin: 0 auto 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    align-items: center;
    justify-content: space-between;
    color: #222;
  }
  .preview-bar a {
    color: #1a1a1a;
    font-size: 13px;
  }
  .preview-bar nav {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .preview-bar .label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .resume {
    background: #fff;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  }
}
@media print {
  .preview-bar { display: none !important; }
  html, body { background: #fff; padding: 0; }
}
`.trim();

function documentHtml(id: ResumeTemplateId, css: string) {
  const meta = RESUME_TEMPLATES.find((item) => item.id === id)!;
  const links = RESUME_TEMPLATES.map((item) => {
    const current = item.id === id ? ' aria-current="page"' : "";
    return `<a href="./${item.id}.html"${current}>${item.label}</a>`;
  }).join("\n        ");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Resume preview — ${meta.label}</title>
  <link rel="stylesheet" href="./${id}.css" />
  <style>${screenChrome}</style>
</head>
<body>
  <div class="preview-bar">
    <div>
      <div class="label">${meta.label} template</div>
      <div style="font-size:12px;color:#555;margin-top:2px">${meta.tagline} · ${meta.bestFor}</div>
    </div>
    <nav>
      <a href="./index.html">All templates</a>
      ${links}
    </nav>
  </div>
  <article class="resume resume--${id}">
${SAMPLE_RESUME_BODY}
  </article>
</body>
</html>
`;
}

function indexHtml() {
  const cards = RESUME_TEMPLATES.map(
    (item) => `    <a class="card" href="./${item.id}.html">
      <strong>${item.label}</strong>
      <span class="tag">${item.tagline}</span>
      <p>${item.description}</p>
      <span class="open">Open preview →</span>
    </a>`,
  ).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Resume templates — preview</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      background: #111114;
      color: #f2f2f4;
      min-height: 100vh;
      padding: 40px 20px 64px;
    }
    main { max-width: 920px; margin: 0 auto; }
    h1 { font-size: 28px; margin: 0 0 8px; letter-spacing: -0.02em; }
    .lead { color: #a8a8b0; margin: 0 0 28px; line-height: 1.5; max-width: 540px; }
    .grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
    .card {
      display: block;
      text-decoration: none;
      color: inherit;
      border: 1px solid #2e2e34;
      background: #18181c;
      border-radius: 16px;
      padding: 18px 18px 16px;
      transition: border-color .15s, background .15s;
    }
    .card:hover { border-color: #6b6b78; background: #1e1e24; }
    .card strong { display: block; font-size: 18px; margin-bottom: 4px; }
    .card .tag {
      display: inline-block;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #9a9aa8;
      margin-bottom: 10px;
    }
    .card p { margin: 0; font-size: 13px; line-height: 1.45; color: #b4b4bc; }
    .card .open { display: inline-block; margin-top: 14px; font-size: 13px; color: #d0d0d8; }
    .frames {
      margin-top: 36px;
      display: grid;
      gap: 20px;
    }
    .frame-wrap h2 {
      font-size: 13px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #8a8a94;
      margin: 0 0 10px;
      font-weight: 600;
    }
    iframe {
      width: 100%;
      height: 920px;
      border: 1px solid #2e2e34;
      border-radius: 12px;
      background: #d8d8dc;
    }
  </style>
</head>
<body>
  <main>
    <h1>Resume templates</h1>
    <p class="lead">
      Static HTML previews with sample content. Open a card for a full-page view, or scroll
      for side-by-side iframes. Print from any preview to check page breaks.
    </p>
    <div class="grid">
${cards}
    </div>
    <div class="frames">
${RESUME_TEMPLATES.map(
  (item) => `      <div class="frame-wrap">
        <h2>${item.label}</h2>
        <iframe title="${item.label} resume preview" src="./${item.id}.html" loading="lazy"></iframe>
      </div>`,
).join("\n")}
    </div>
  </main>
</body>
</html>
`;
}

mkdirSync(OUT, { recursive: true });

for (const id of Object.keys(STYLES) as ResumeTemplateId[]) {
  writeFileSync(join(OUT, `${id}.css`), `${STYLES[id]}\n`, "utf8");
  writeFileSync(join(OUT, `${id}.html`), documentHtml(id, STYLES[id]), "utf8");
  console.log(`wrote ${id}.html + ${id}.css`);
}

writeFileSync(join(OUT, "index.html"), indexHtml(), "utf8");
console.log("wrote index.html");
console.log(`\nPreviews: ${OUT}`);
console.log("Open /resume-templates/ while the app is running, or open the HTML files directly.");
