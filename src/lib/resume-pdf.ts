import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { JobApplication } from "@/types/application";
import type { SiteContent } from "@/types/content";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const INK = rgb(0.09, 0.09, 0.1);
const MUTED = rgb(0.32, 0.32, 0.34);
const RULE = rgb(0.82, 0.82, 0.84);

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

  const splitWord = (word: string) => {
    if (widthOf(word) <= maxWidth) return [word];
    const parts: string[] = [];
    let chunk = "";
    for (const char of word) {
      const next = chunk + char;
      if (chunk && widthOf(next) > maxWidth) {
        parts.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    if (chunk) parts.push(chunk);
    return parts;
  };

  for (const word of words) {
    for (const part of splitWord(word)) {
      const next = current ? `${current} ${part}` : part;
      if (current && widthOf(next) > maxWidth) {
        lines.push(current);
        current = part;
      } else {
        current = next;
      }
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

class PdfWriter {
  private pdf!: PDFDocument;
  private page!: PDFPage;
  private font!: PDFFont;
  private bold!: PDFFont;
  private y = PAGE_H - MARGIN;
  private readonly width = PAGE_W - MARGIN * 2;

  async init() {
    this.pdf = await PDFDocument.create();
    this.font = await this.pdf.embedFont(StandardFonts.Helvetica);
    this.bold = await this.pdf.embedFont(StandardFonts.HelveticaBold);
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.y = PAGE_H - MARGIN;
  }

  setMeta(title: string, author: string) {
    this.pdf.setTitle(title);
    this.pdf.setAuthor(author);
    this.pdf.setCreator(author);
    this.pdf.setProducer(author);
  }

  private ensure(height: number) {
    if (this.y - height >= MARGIN) return;
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.y = PAGE_H - MARGIN;
  }

  gap(size = 10) {
    this.ensure(size);
    this.y -= size;
  }

  text(value: string, options: { size: number; bold?: boolean; color?: ReturnType<typeof rgb>; leading?: number }) {
    const font = options.bold ? this.bold : this.font;
    const leading = options.leading ?? options.size + 3;
    const lines = wrap(value, font, options.size, this.width);
    for (const line of lines) {
      this.ensure(leading);
      this.page.drawText(line, {
        x: MARGIN,
        y: this.y - options.size,
        size: options.size,
        font,
        color: options.color ?? INK,
      });
      this.y -= leading;
    }
  }

  heading(label: string) {
    this.gap(16);
    this.text(label.toUpperCase(), { size: 10, bold: true, leading: 13 });
    this.page.drawLine({
      start: { x: MARGIN, y: this.y + 2 },
      end: { x: PAGE_W - MARGIN, y: this.y + 2 },
      thickness: 0.6,
      color: RULE,
    });
    this.gap(8);
  }

  bullet(value: string) {
    const size = 10;
    const leading = 14;
    const indent = 12;
    const font = this.font;
    const lines = wrap(value, font, size, this.width - indent);
    for (const [index, line] of lines.entries()) {
      this.ensure(leading);
      if (index === 0) {
        this.page.drawText("-", {
          x: MARGIN,
          y: this.y - size,
          size,
          font,
          color: INK,
        });
      }
      this.page.drawText(line, {
        x: MARGIN + indent,
        y: this.y - size,
        size,
        font,
        color: INK,
      });
      this.y -= leading;
    }
  }

  async save() {
    return Buffer.from(await this.pdf.save());
  }
}

export async function resumePdf(content: SiteContent, application: JobApplication) {
  const { profile, social } = content;
  const { resume } = application;
  const writer = new PdfWriter();
  await writer.init();
  writer.setMeta(`${profile.name} — ${resume.targetRole}`, profile.name);

  writer.text(profile.name, { size: 20, bold: true, leading: 24 });
  writer.text(`${resume.targetRole}  |  ${profile.location}`, { size: 11, color: MUTED, leading: 15 });
  const contact = [profile.email, social.linkedin, social.github, profile.website || social.website]
    .filter(Boolean)
    .join("  ·  ");
  if (contact) writer.text(contact, { size: 9, color: MUTED, leading: 13 });

  if (resume.summary) {
    writer.heading("Summary");
    writer.text(resume.summary, { size: 10, leading: 14 });
  }

  if (resume.skills.length) {
    writer.heading("Skills");
    for (const group of resume.skills) {
      writer.text(`${group.label}: ${group.items.join(", ")}`, { size: 10, leading: 14 });
    }
  }

  if (resume.experience.length) {
    writer.heading("Experience");
    for (const item of resume.experience) {
      writer.gap(4);
      writer.text(`${item.role}  ·  ${item.company}`, { size: 11, bold: true, leading: 14 });
      const meta = [item.period, item.location].filter(Boolean).join("  ·  ");
      if (meta) writer.text(meta, { size: 9, color: MUTED, leading: 13 });
      for (const bullet of item.bullets) writer.bullet(bullet);
    }
  }

  if (resume.projects.length) {
    writer.heading("Projects");
    for (const project of resume.projects) {
      writer.gap(4);
      writer.text(project.title, { size: 11, bold: true, leading: 14 });
      if (project.line) writer.text(project.line, { size: 10, color: MUTED, leading: 14 });
      for (const bullet of project.bullets ?? []) writer.bullet(bullet);
    }
  }

  return writer.save();
}

export async function coverLetterPdf(content: SiteContent, application: JobApplication) {
  const { profile } = content;
  const writer = new PdfWriter();
  await writer.init();
  writer.setMeta(`Cover letter — ${application.role}, ${application.company}`, profile.name);

  writer.text(profile.name, { size: 16, bold: true, leading: 20 });
  if (profile.email) writer.text(profile.email, { size: 10, color: MUTED, leading: 14 });
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
  const writer = new PdfWriter();
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
