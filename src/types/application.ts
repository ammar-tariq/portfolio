export type ApplicationStatus = "draft" | "applied" | "archived";

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
  resume: GeneratedResume;
  coverLetter: string;
  answers: ApplicationAnswer[];
  files: {
    resumeTxt?: ApplicationFile;
    resumeHtml?: ApplicationFile;
    coverLetter?: ApplicationFile;
    answers?: ApplicationFile;
  };
  status: ApplicationStatus;
  warning?: string;
  createdAt?: string;
  updatedAt?: string;
};
