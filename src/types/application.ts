import type { ResumeTemplateId } from "@/lib/resume-templates/types";

export type ApplicationStatus = "draft" | "applied" | "archived";

export type InboxStatus = "none" | "replied" | "interview" | "rejected" | "offer";

export type ApplicationFile = {
  url: string;
  publicId: string;
};

export type ApplicationSkillGroup = {
  label: string;
  items: string[];
};

export type ApplicationExperience = {
  company: string;
  role: string;
  period: string;
  location?: string;
  bullets: string[];
};

export type ApplicationProject = {
  title: string;
  slug?: string;
  line: string;
  bullets?: string[];
};

export type ApplicationSend = {
  to: string;
  cc?: string;
  subject: string;
  via: "gmail-api" | "smtp";
  messageId?: string;
  threadId?: string;
  attached: string[];
  createdAt?: string;
};

export type ApplicationReply = {
  messageId: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  classification: InboxStatus;
  receivedAt?: string;
};

export type ApplicationAnswer = {
  question: string;
  answer: string;
  createdAt?: string;
};

export type GeneratedResume = {
  targetRole: string;
  company: string;
  keywordsUsed: string[];
  summary: string;
  skills: ApplicationSkillGroup[];
  experience: ApplicationExperience[];
  projects: ApplicationProject[];
};

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  jobUrl?: string;
  location?: string;
  jd: string;
  aboutCompany: string;
  extraQuestions: string;
  keywords: string[];
  /** Per-application resume skin; falls back to site defaultResumeTemplate. */
  resumeTemplate?: ResumeTemplateId;
  resume: GeneratedResume;
  coverLetter: string;
  answers: ApplicationAnswer[];
  sends: ApplicationSend[];
  replies: ApplicationReply[];
  inboxStatus?: InboxStatus;
  files: {
    resumePdf?: ApplicationFile;
    resumeTxt?: ApplicationFile;
    resumeHtml?: ApplicationFile;
    coverLetter?: ApplicationFile;
    answers?: ApplicationFile;
  };
  status: ApplicationStatus;
  warning?: string;
  sentAt?: string;
  lastReplyAt?: string;
  createdAt?: string;
  updatedAt?: string;
};
