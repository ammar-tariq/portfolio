import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  DEFAULT_RESUME_TEMPLATE,
  resumeContactItems,
  resumeContactParts,
  resolveResumeTemplateId,
  type ResumeTemplateId,
} from "@/lib/resume-templates";
import type { JobApplication } from "@/types/application";
import type { SiteContent } from "@/types/content";

const PAGE_W = 612;
const PAGE_H = 792;
const INK = rgb(0.07, 0.07, 0.08);
const MUTED = rgb(0.32, 0.32, 0.34);
const SOFT = rgb(0.55, 0.55, 0.58);
const RULE = rgb(0.76, 0.76, 0.78);
/** Slate-teal accent for Modern template (#1e4a5c). */
const ACCENT = rgb(0.118, 0.29, 0.361);

type TemplateMetrics = {
  marginX: number;
  marginY: number;
  nameSize: number;
  titleSize: number;
  placeSize: number;
  contactSize: number;
  sectionSize: number;
  jobSize: number;
  bodySize: number;
  metaSize: number;
  sectionGap: number;
  jobGap: number;
  bulletLeading: number;
  bodyLeading: number;
  headerAlign: "center" | "left";
  nameUpper: boolean;
  nameTracking: number;
  ruleWeight: number;
  topRule: boolean;
  accentHeader?: boolean;
  accentSections?: boolean;
  shortSectionRule?: boolean;
};

const METRICS: Record<ResumeTemplateId, TemplateMetrics> = {
  classic: {
    marginX: 48,
    marginY: 46,
    nameSize: 20,
    titleSize: 11,
    placeSize: 9,
    contactSize: 9,
    sectionSize: 9,
    jobSize: 11,
    bodySize: 10,
    metaSize: 9.5,
    sectionGap: 14,
    jobGap: 10,
    bulletLeading: 13,
    bodyLeading: 13.5,
    headerAlign: "center",
    nameUpper: true,
    nameTracking: 0.6,
    ruleWeight: 1.4,
    topRule: false,
  },
  executive: {
    marginX: 50,
    marginY: 48,
    nameSize: 22,
    titleSize: 11.5,
    placeSize: 9.25,
    contactSize: 9,
    sectionSize: 8.75,
    jobSize: 11,
    bodySize: 10,
    metaSize: 9.5,
    sectionGap: 16,
    jobGap: 11,
    bulletLeading: 13.5,
    bodyLeading: 14,
    headerAlign: "left",
    nameUpper: false,
    nameTracking: 0,
    ruleWeight: 2.4,
    topRule: true,
  },
  compact: {
    marginX: 42,
    marginY: 40,
    nameSize: 16,
    titleSize: 9.5,
    placeSize: 8,
    contactSize: 8,
    sectionSize: 8,
    jobSize: 9.5,
    bodySize: 9,
    metaSize: 8.25,
    sectionGap: 10,
    jobGap: 7,
    bulletLeading: 11.5,
    bodyLeading: 12,
    headerAlign: "center",
    nameUpper: true,
    nameTracking: 0.45,
    ruleWeight: 1.15,
    topRule: false,
  },
  modern: {
    marginX: 48,
    marginY: 46,
    nameSize: 21,
    titleSize: 11,
    placeSize: 9,
    contactSize: 9,
    sectionSize: 8.5,
    jobSize: 11,
    bodySize: 10,
    metaSize: 9,
    sectionGap: 15,
    jobGap: 11,
    bulletLeading: 13.5,
    bodyLeading: 14,
    headerAlign: "left",
    nameUpper: false,
    nameTracking: 0,
    ruleWeight: 0,
    topRule: false,
    accentHeader: true,
    accentSections: true,
    shortSectionRule: true,
  },
};

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

class PdfWriter {
  private pdf!: PDFDocument;
  private page!: PDFPage;
  private font!: PDFFont;
  private bold!: PDFFont;
  private y = PAGE_H;
  private pageIndex = 0;
  private runningHeader = "";
  readonly metrics: TemplateMetrics;
  private readonly marginX: number;
  private readonly marginY: number;
  private readonly width: number;

  constructor(templateId: ResumeTemplateId) {
    this.metrics = METRICS[templateId];
    this.marginX = this.metrics.marginX;
    this.marginY = this.metrics.marginY;
    this.width = PAGE_W - this.marginX * 2;
  }

  async init() {
    this.pdf = await PDFDocument.create();
    this.font = await this.pdf.embedFont(StandardFonts.Helvetica);
    this.bold = await this.pdf.embedFont(StandardFonts.HelveticaBold);
    this.addPage();
  }

  setMeta(title: string, author: string) {
    this.pdf.setTitle(title);
    this.pdf.setAuthor(author);
    this.pdf.setCreator(author);
    this.pdf.setProducer(author);
  }

  setRunningHeader(value: string) {
    this.runningHeader = pdfSafe(value);
  }

  private addPage() {
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.pageIndex += 1;
    this.y = PAGE_H - this.marginY;
    if (this.pageIndex > 1 && this.runningHeader) {
      this.page.drawText(this.runningHeader, {
        x: this.marginX,
        y: PAGE_H - this.marginY + 14,
        size: 8,
        font: this.font,
        color: SOFT,
      });
      this.page.drawText(String(this.pageIndex), {
        x: PAGE_W - this.marginX - this.font.widthOfTextAtSize(String(this.pageIndex), 8),
        y: this.marginY - 18,
        size: 8,
        font: this.font,
        color: SOFT,
      });
    }
  }

  private ensure(height: number) {
    if (this.y - height >= this.marginY) return;
    this.addPage();
  }

  /** Keep a block together: if it won't fit, start a new page first. */
  keep(height: number) {
    if (this.y - height < this.marginY) this.addPage();
  }

  gap(size: number) {
    this.ensure(size);
    this.y -= size;
  }

  private drawAligned(
    value: string,
    options: {
      size: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
      align?: "left" | "center" | "right";
      maxWidth?: number;
      leading?: number;
    },
  ) {
    const font = options.bold ? this.bold : this.font;
    const leading = options.leading ?? options.size + 3;
    const maxWidth = options.maxWidth ?? this.width;
    const lines = wrap(value, font, options.size, maxWidth);
    const align = options.align ?? "left";

    for (const line of lines) {
      this.ensure(leading);
      const textWidth = font.widthOfTextAtSize(line, options.size);
      let x = this.marginX;
      if (align === "center") x = this.marginX + (this.width - textWidth) / 2;
      if (align === "right") x = PAGE_W - this.marginX - textWidth;
      this.page.drawText(line, {
        x,
        y: this.y - options.size,
        size: options.size,
        font,
        color: options.color ?? INK,
      });
      this.y -= leading;
    }
  }

  text(
    value: string,
    options: {
      size: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
      leading?: number;
      align?: "left" | "center" | "right";
      maxWidth?: number;
    },
  ) {
    this.drawAligned(value, options);
  }

  /** Role left, dates right on the same baseline. */
  splitLine(left: string, right: string, options: { leftSize: number; rightSize: number; boldLeft?: boolean }) {
    const leftFont = options.boldLeft === false ? this.font : this.bold;
    const rightSafe = pdfSafe(right);
    const leftSafe = pdfSafe(left);
    const rightWidth = rightSafe ? this.font.widthOfTextAtSize(rightSafe, options.rightSize) : 0;
    const gap = rightSafe ? 14 : 0;
    const leftMax = this.width - rightWidth - gap;
    const leftLines = wrap(leftSafe, leftFont, options.leftSize, Math.max(80, leftMax));
    const rowHeight = Math.max(options.leftSize, options.rightSize) + 3;
    this.keep(rowHeight + 2);

    const first = leftLines[0] ?? "";
    this.ensure(rowHeight);
    this.page.drawText(first, {
      x: this.marginX,
      y: this.y - options.leftSize,
      size: options.leftSize,
      font: leftFont,
      color: INK,
    });
    if (rightSafe) {
      this.page.drawText(rightSafe, {
        x: PAGE_W - this.marginX - rightWidth,
        y: this.y - options.rightSize,
        size: options.rightSize,
        font: this.font,
        color: this.metrics.accentSections ? ACCENT : MUTED,
      });
    }
    this.y -= rowHeight;

    for (const line of leftLines.slice(1)) {
      this.ensure(rowHeight);
      this.page.drawText(line, {
        x: this.marginX,
        y: this.y - options.leftSize,
        size: options.leftSize,
        font: leftFont,
        color: INK,
      });
      this.y -= rowHeight;
    }
  }

  rule(weight = 0.7, color = RULE) {
    this.ensure(6);
    this.page.drawLine({
      start: { x: this.marginX, y: this.y },
      end: { x: PAGE_W - this.marginX, y: this.y },
      thickness: weight,
      color,
    });
    this.y -= 4;
  }

  heading(label: string) {
    const m = this.metrics;
    const accent = Boolean(m.accentSections);
    this.gap(m.sectionGap);
    this.text(label.toUpperCase(), {
      size: m.sectionSize,
      bold: true,
      leading: m.sectionSize + 3,
      align: "left",
      color: accent ? ACCENT : INK,
    });
    this.gap(3);
    if (m.shortSectionRule) {
      this.page.drawRectangle({
        x: this.marginX,
        y: this.y - 1,
        width: 28,
        height: 1.75,
        color: ACCENT,
      });
      this.y -= 6;
    } else {
      this.rule(m.headerAlign === "left" ? 1.1 : 0.65, m.headerAlign === "left" ? INK : RULE);
    }
    this.gap(6);
  }

  bullet(value: string) {
    const m = this.metrics;
    const size = m.bodySize;
    const leading = m.bulletLeading;
    const indent = 12;
    const lines = wrap(value, this.font, size, this.width - indent);
    const dot = m.accentSections ? ACCENT : INK;
    for (const [index, line] of lines.entries()) {
      this.ensure(leading);
      if (index === 0) {
        this.page.drawCircle({
          x: this.marginX + 2.2,
          y: this.y - size + 3.2,
          size: 1.35,
          color: dot,
        });
      }
      this.page.drawText(line, {
        x: this.marginX + indent,
        y: this.y - size,
        size,
        font: this.font,
        color: INK,
      });
      this.y -= leading;
    }
  }

  /** Bold label + regular items on one row (skills). */
  skillRow(label: string, items: string) {
    const m = this.metrics;
    const size = m.bodySize;
    const leading = m.bodyLeading;
    const labelSafe = pdfSafe(label);
    const labelWidth = this.bold.widthOfTextAtSize(labelSafe, size);
    const gutter = 6;
    const itemMax = Math.max(60, this.width - labelWidth - gutter);
    const itemLines = wrap(items, this.font, size, itemMax);
    const labelColor = m.accentSections ? ACCENT : INK;

    this.ensure(leading);
    this.page.drawText(labelSafe, {
      x: this.marginX,
      y: this.y - size,
      size,
      font: this.bold,
      color: labelColor,
    });
    const first = itemLines[0] ?? "";
    if (first) {
      this.page.drawText(first, {
        x: this.marginX + labelWidth + gutter,
        y: this.y - size,
        size,
        font: this.font,
        color: INK,
      });
    }
    this.y -= leading;
    for (const cont of itemLines.slice(1)) {
      this.ensure(leading);
      this.page.drawText(cont, {
        x: this.marginX + labelWidth + gutter,
        y: this.y - size,
        size,
        font: this.font,
        color: INK,
      });
      this.y -= leading;
    }
  }

  headerBlock(input: {
    name: string;
    title: string;
    location?: string;
    contactItems: string[];
  }) {
    const m = this.metrics;
    const align = m.headerAlign;

    if (m.topRule) {
      this.rule(m.ruleWeight, INK);
      this.gap(8);
    }

    const name = m.nameUpper ? pdfSafe(input.name).toUpperCase() : pdfSafe(input.name);
    const spacedName =
      m.nameTracking > 0
        ? name
            .split("")
            .join(" ")
            .replace(/ {2,}/g, " ")
        : name;

    if (m.accentHeader) {
      const pad = 12;
      const headerTop = this.y;
      const textX = this.marginX + pad;
      const textWidth = this.width - pad;

      const drawLeft = (value: string, opts: { size: number; bold?: boolean; color?: ReturnType<typeof rgb>; leading?: number }) => {
        const font = opts.bold ? this.bold : this.font;
        const leading = opts.leading ?? opts.size + 3;
        const lines = wrap(value, font, opts.size, textWidth);
        for (const line of lines) {
          this.ensure(leading);
          this.page.drawText(line, {
            x: textX,
            y: this.y - opts.size,
            size: opts.size,
            font,
            color: opts.color ?? INK,
          });
          this.y -= leading;
        }
      };

      drawLeft(spacedName, { size: m.nameSize, bold: true, leading: m.nameSize + 3 });
      this.gap(2);
      drawLeft(input.title, { size: m.titleSize, bold: true, color: ACCENT, leading: m.titleSize + 3 });
      if (input.location) {
        drawLeft(input.location, { size: m.placeSize, color: MUTED, leading: m.placeSize + 3 });
      }
      this.gap(5);
      if (input.contactItems.length) {
        drawLeft(input.contactItems.join("  ·  "), {
          size: m.contactSize,
          color: MUTED,
          leading: m.contactSize + 3.5,
        });
      }
      const barHeight = Math.max(24, headerTop - this.y);
      this.page.drawRectangle({
        x: this.marginX,
        y: this.y,
        width: 3.5,
        height: barHeight,
        color: ACCENT,
      });
      this.gap(12);
      return;
    }

    this.text(spacedName, {
      size: m.nameSize,
      bold: true,
      leading: m.nameSize + 3,
      align,
    });
    this.gap(2);
    this.text(input.title, {
      size: m.titleSize,
      bold: align === "left",
      leading: m.titleSize + 3,
      align,
      color: INK,
    });
    if (input.location) {
      this.text(input.location, { size: m.placeSize, color: MUTED, leading: m.placeSize + 3, align });
    }
    this.gap(5);
    if (input.contactItems.length) {
      const sep = align === "left" ? "  |  " : "  ·  ";
      this.text(input.contactItems.join(sep), {
        size: m.contactSize,
        color: MUTED,
        leading: m.contactSize + 3.5,
        align,
      });
    }
    this.gap(8);
    if (m.ruleWeight > 0) {
      this.rule(m.topRule ? 1 : m.ruleWeight, INK);
    }
    this.gap(4);
  }

  async save() {
    return Buffer.from(await this.pdf.save());
  }
}

function resolveTemplate(content: SiteContent, application: JobApplication): ResumeTemplateId {
  return resolveResumeTemplateId(
    application.resumeTemplate,
    resolveResumeTemplateId(content.defaultResumeTemplate, DEFAULT_RESUME_TEMPLATE),
  );
}

export async function resumePdf(content: SiteContent, application: JobApplication) {
  const { profile, social } = content;
  const { resume } = application;
  const templateId = resolveTemplate(content, application);
  const writer = new PdfWriter(templateId);
  await writer.init();
  writer.setMeta(`${profile.name} — ${resume.targetRole}`, profile.name);
  writer.setRunningHeader(`${profile.name}  ·  ${resume.targetRole || profile.title}`);

  const contactItems = resumeContactItems(resumeContactParts(profile, social));
  writer.headerBlock({
    name: profile.name,
    title: resume.targetRole || profile.title,
    location: profile.location,
    contactItems,
  });

  const m = writer.metrics;

  if (resume.summary) {
    writer.heading("Summary");
    writer.text(resume.summary, { size: m.bodySize, leading: m.bodyLeading });
  }

  if (resume.experience.length) {
    writer.heading("Experience");
    for (const item of resume.experience) {
      const org = [item.company, item.location].filter(Boolean).join("  ·  ");
      const blockEstimate = m.jobSize + 4 + (org ? m.metaSize + 4 : 0) + Math.min(item.bullets.length, 1) * m.bulletLeading;
      writer.keep(blockEstimate);
      writer.gap(m.jobGap * 0.35);
      writer.splitLine(item.role, item.period, {
        leftSize: m.jobSize,
        rightSize: m.metaSize,
        boldLeft: true,
      });
      if (org) {
        writer.text(org, {
          size: m.metaSize,
          color: MUTED,
          leading: m.metaSize + 3,
        });
      }
      writer.gap(2);
      for (const bullet of item.bullets) writer.bullet(bullet);
      writer.gap(m.jobGap * 0.25);
    }
  }

  if (resume.projects.length) {
    writer.heading("Projects");
    for (const project of resume.projects) {
      writer.keep(m.jobSize + 8 + (project.line ? m.bodyLeading : 0));
      writer.gap(m.jobGap * 0.3);
      writer.splitLine(project.title, "", { leftSize: m.jobSize, rightSize: m.metaSize });
      if (project.line) {
        writer.text(project.line, { size: m.bodySize, color: MUTED, leading: m.bodyLeading });
      }
      for (const bullet of project.bullets ?? []) writer.bullet(bullet);
    }
  }

  if (resume.skills.length) {
    writer.heading("Skills");
    for (const group of resume.skills) {
      writer.skillRow(group.label, group.items.join(", "));
    }
  }

  return writer.save();
}

export async function coverLetterPdf(content: SiteContent, application: JobApplication) {
  const { profile, social } = content;
  const writer = new PdfWriter("classic");
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
  const writer = new PdfWriter("classic");
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
