import { classicCss } from "./styles/classic";
import { compactCss } from "./styles/compact";
import { executiveCss } from "./styles/executive";
import { modernCss } from "./styles/modern";
import { resumePageCss } from "./page";
import {
  DEFAULT_RESUME_TEMPLATE,
  type ResumeTemplateId,
  type ResumeTemplateMeta,
} from "./types";

export const RESUME_TEMPLATES: ResumeTemplateMeta[] = [
  {
    id: "classic",
    label: "Classic",
    tagline: "Default · ATS-safe",
    description:
      "Centered masthead, hairline section rules, role left / dates right. Clean Harvard-style single column for most applications.",
    bestFor: "Default for almost every role",
    previewPath: "/resume-templates/classic.html",
  },
  {
    id: "executive",
    label: "Executive",
    tagline: "Senior presence",
    description:
      "Left-aligned name, heavier top rule, italic company line, stronger section dividers. Same ATS geometry with more gravitas.",
    bestFor: "Staff, lead, and senior roles",
    previewPath: "/resume-templates/executive.html",
  },
  {
    id: "compact",
    label: "Compact",
    tagline: "One-page fit",
    description:
      "Classic layout with tighter type and spacing so long Experience + Projects drafts still fit a single page.",
    bestFor: "Long AI drafts without regenerating",
    previewPath: "/resume-templates/compact.html",
  },
  {
    id: "modern",
    label: "Modern",
    tagline: "Accent · open",
    description:
      "Left accent bar, slate-teal section marks, title-case name, open leading. Contemporary product-engineering look without sidebars or icons.",
    bestFor: "Startups, product, and design-adjacent roles",
    previewPath: "/resume-templates/modern.html",
  },
];

const SKINS: Record<ResumeTemplateId, string> = {
  classic: classicCss,
  executive: executiveCss,
  compact: compactCss,
  modern: modernCss,
};

export function resumeTemplateMeta(id: ResumeTemplateId): ResumeTemplateMeta {
  return RESUME_TEMPLATES.find((item) => item.id === id) ?? RESUME_TEMPLATES[0]!;
}

/** Full stylesheet: shared A4/pagination + skin. */
export function resumeTemplateCss(id: ResumeTemplateId = DEFAULT_RESUME_TEMPLATE): string {
  const skin = SKINS[id] ?? SKINS[DEFAULT_RESUME_TEMPLATE];
  return `${resumePageCss}\n\n${skin}`;
}
