export const RESUME_TEMPLATE_IDS = ["classic", "executive", "compact", "modern"] as const;

export type ResumeTemplateId = (typeof RESUME_TEMPLATE_IDS)[number];

export const DEFAULT_RESUME_TEMPLATE: ResumeTemplateId = "modern";

export type ResumeTemplateMeta = {
  id: ResumeTemplateId;
  label: string;
  tagline: string;
  description: string;
  bestFor: string;
  /** Static HTML preview under /public/resume-templates */
  previewPath: string;
};

export type ResumeContactParts = {
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
};

export function isResumeTemplateId(value: unknown): value is ResumeTemplateId {
  return typeof value === "string" && (RESUME_TEMPLATE_IDS as readonly string[]).includes(value);
}

export function resolveResumeTemplateId(value: unknown, fallback: ResumeTemplateId = DEFAULT_RESUME_TEMPLATE): ResumeTemplateId {
  return isResumeTemplateId(value) ? value : fallback;
}
