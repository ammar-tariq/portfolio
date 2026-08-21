import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  DEFAULT_RESUME_TEMPLATE,
  resumeContactItems,
  resumeContactParts,
  resumeDocumentHtml,
  htmlToA4Pdf,
  resolveResumeTemplateId,
} from "@/lib/resume-templates";
import type { JobApplication } from "@/types/application";
import type { SiteContent } from "@/types/content";

/** A4 in PDF points (1pt = 1/72"). */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 48;
const MARGIN_Y = 52;
const INK = rgb(0.07, 0.07, 0.08);
const MUTED = rgb(0.32, 0.32, 0.34);
const RULE = rgb(0.76, 0.76, 0.78);

function pdfSafe(value: string) {
  return value
    .replaceAll("\u2018", "'")
    .replaceAll("\u2019", "'")
    .replaceAll("\u201C", '"')
    .replaceAll("\u201D", '"')
    .replaceAll("\u2013", "-")
    .replaceAll("\u2014", "-")
    .replaceAll("\u2212", "-")
    .replaceAll("\u2022", "-")
    .replaceAll("\u2026", "...")
    .replaceAll("\u00A0", " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\t\n\r\x20-\x7E\xA0-\xFF]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = pdfSafe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  const widthOf = (value: string) => font.widthOfTextAtSize(value, size);

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && widthOf(next) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function resumePdfFilename(name: string, role?: string) {
  const safe = (value: string) =>
    value.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
  const who = safe(name) || "Resume";
  const title = role ? safe(role) : "";
  return title ? `${who} - ${title}.pdf` : `${who} Resume.pdf`;
}

export function coverLetterPdfFilename(name: string, company?: string) {
  const safe = (value: string) =>
    value.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
  const who = safe(name) || "Cover Letter";
  const where = company ? safe(company) : "";
  return where ? `${who} - ${where} Cover Letter.pdf` : `${who} Cover Letter.pdf`;
}

export function answersPdfFilename(name: string, company?: string) {
  const safe = (value: string) =>
    value.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
  const who = safe(name) || "Answers";
  const where = company ? safe(company) : "";
  return where ? `${who} - ${where} Answers.pdf` : `${who} Answers.pdf`;
}

export function pdfFileResponse(buffer: Buffer, filename: string) {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replaceAll('"', "");
  const encoded = encodeURIComponent(filename);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Resume PDF = same HTML as the A4 preview, printed through Chromium.
 * Pagination (no orphan headings) comes from CSS break-* rules.
 */
export async function resumePdf(content: SiteContent, application: JobApplication) {
  const html = resumeDocumentHtml(content, application, {
    siteDefault: resolveResumeTemplateId(content.defaultResumeTemplate, DEFAULT_RESUME_TEMPLATE),
  });
  return htmlToA4Pdf(html);
}

/** Lightweight A4 writer for cover letters / screening answers. */
class SimplePdf {
  private pdf!: PDFDocument;
  private page!: PDFPage;
  private font!: PDFFont;
  private bold!: PDFFont;
  private y = PAGE_H - MARGIN_Y;
  private readonly width = PAGE_W - MARGIN_X * 2;

  async init() {
    this.pdf = await PDFDocument.create();
    this.font = await this.pdf.embedFont(StandardFonts.Helvetica);
    this.bold = await this.pdf.embedFont(StandardFonts.HelveticaBold);
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.y = PAGE_H - MARGIN_Y;
  }

  setMeta(title: string, author: string) {
    this.pdf.setTitle(title);
    this.pdf.setAuthor(author);
    this.pdf.setCreator(author);
    this.pdf.setProducer(author);
  }

  private ensure(height: number) {
    if (this.y - height >= MARGIN_Y) return;
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.y = PAGE_H - MARGIN_Y;
  }

  gap(size: number) {
    this.ensure(size);
    this.y -= size;
  }

  text(value: string, options: { size: number; bold?: boolean; color?: ReturnType<typeof rgb>; leading?: number }) {
    const font = options.bold ? this.bold : this.font;
    const leading = options.leading ?? options.size + 3;
    for (const line of wrap(value, font, options.size, this.width)) {
      this.ensure(leading);
      this.page.drawText(line, {
        x: MARGIN_X,
        y: this.y - options.size,
        size: options.size,
        font,
        color: options.color ?? INK,
      });
      this.y -= leading;
    }
  }

  heading(label: string) {
    this.gap(14);
    this.text(label.toUpperCase(), { size: 9, bold: true, leading: 12 });
    this.gap(2);
    this.page.drawLine({
      start: { x: MARGIN_X, y: this.y },
      end: { x: PAGE_W - MARGIN_X, y: this.y },
      thickness: 0.6,
      color: RULE,
    });
    this.gap(8);
  }

  async save() {
    return Buffer.from(await this.pdf.save());
  }
}

export async function coverLetterPdf(content: SiteContent, application: JobApplication) {
  const { profile, social } = content;
  const writer = new SimplePdf();
  await writer.init();
  writer.setMeta(`Cover letter — ${application.role}, ${application.company}`, profile.name);

  const contactItems = resumeContactItems(resumeContactParts(profile, social));
  writer.text(profile.name, { size: 16, bold: true, leading: 20 });
  for (const item of contactItems) {
    writer.text(item, { size: 10, color: MUTED, leading: 13 });
  }
  writer.gap(16);
  writer.text(`Re: ${application.role} — ${application.company}`, { size: 11, bold: true, leading: 16 });
  writer.gap(10);
  for (const paragraph of application.coverLetter.trim().split(/\n{2,}/)) {
    writer.text(paragraph.replaceAll("\n", " "), { size: 10, leading: 15 });
    writer.gap(8);
  }
  return writer.save();
}

export async function answersPdf(application: JobApplication) {
  const writer = new SimplePdf();
  await writer.init();
  writer.setMeta(`Screening answers — ${application.role}, ${application.company}`, application.resume.targetRole);

  writer.text("Screening answers", { size: 16, bold: true, leading: 20 });
  writer.text(`${application.role}  ·  ${application.company}`, { size: 10, color: MUTED, leading: 14 });

  for (const [index, item] of application.answers.entries()) {
    writer.heading(`Question ${index + 1}`);
    writer.text(item.question, { size: 10, bold: true, leading: 14 });
    writer.gap(6);
    writer.text(item.answer, { size: 10, leading: 14 });
  }
  return writer.save();
}
