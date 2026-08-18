export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption?: string;
  publicId?: string;
};

export type ProjectVisual =
  | "dojo"
  | "glass"
  | "signal"
  | "frame"
  | "hub"
  | "map"
  | "orbit"
  | "horizon"
  | "catalog";

export type ProjectStatus = "shipped" | "active" | "internal";

export type Project = {
  slug: string;
  title: string;
  seoLabel: string;
  seoDescription: string;
  tagline: string;
  description: string;
  industries: string[];
  role: string;
  year?: string;
  status?: ProjectStatus;
  featured?: boolean;
  listed?: boolean;
  technologies: string[];
  github?: string;
  liveUrl?: string;
  liveLabel?: string;
  appStoreUrl?: string;
  webUrl?: string;
  webLabel?: string;
  challenge?: string;
  solution?: string;
  architecture: string[];
  engineering?: string[];
  outcome?: string;
  highlights: string[];
  screenshots?: ProjectScreenshot[];
  iosScreenshots?: ProjectScreenshot[];
  androidScreenshots?: ProjectScreenshot[];
  logo?: string;
  logoPublicId?: string;
  banner?: string;
  bannerPublicId?: string;
  video?: string;
  videoPublicId?: string;
  videoUrl?: string;
  ogImage?: string;
  ogImagePublicId?: string;
  applicationCategory?: string;
  visual: ProjectVisual;
  sortOrder?: number;
  updatedAt?: string;
};

export type Industry = {
  id: string;
  label: string;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  year: string;
  location?: string;
  summary: string;
  technologies: string[];
  responsibilities: string[];
  projects: string[];
  sortOrder?: number;
};

export type SkillCategory = {
  id: string;
  label: string;
  summary: string;
  items: { name: string; note?: string }[];
  sortOrder?: number;
};

export type Principle = {
  id: string;
  title: string;
  statement: string;
  body: string;
  sortOrder?: number;
};

export type GraphNode = {
  id: string;
  label: string;
  layer?: number;
  detail?: string;
};

export type IdentityBranch = {
  id: string;
  label: string;
  detail?: string;
  children: string[];
};

export type IdentityGraph = {
  root: { id: string; label: string; detail?: string };
  branches: IdentityBranch[];
  foundation: { id: string; label: string; detail?: string };
};

export type ArchitectureLayer = {
  id: string;
  label: string;
  detail?: string;
  children?: { id: string; label: string; detail?: string }[];
};

export type PipelineStep = {
  id: string;
  label: string;
  detail?: string;
};

export type AiConcept = {
  id: string;
  label: string;
  body: string;
};

export type ArchitectureContent = {
  identityGraph: IdentityGraph;
  systemArchitecture: ArchitectureLayer[];
  aiPipeline: PipelineStep[];
  aiConcepts: AiConcept[];
};

export type OpenSourceProject = {
  slug: string;
  title: string;
  description: string;
  repoUrl: string;
  demoUrl?: string;
  demoLabel?: string;
  language: string;
  topics: string[];
  sortOrder?: number;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

export type Profile = {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  headline: string;
  summary: string;
  location: string;
  availability: string;
  yearsExperience: number;
  email: string;
  resumeUrl: string;
  website: string;
  focus: string[];
  aboutHeadline: string;
  aboutBody: string;
};

export type Social = {
  github: string;
  githubHandle: string;
  linkedin: string;
  medium: string;
  calendly: string;
  whatsapp: string;
  upwork: string;
  website: string;
  twitter?: string;
  cursorHandle?: string;
};

export type SeoSettings = {
  title: string;
  description: string;
  keywords: string[];
  topics: string[];
  googleVerification?: string;
  bingVerification?: string;
  defaultOgImage?: string;
  defaultOgImagePublicId?: string;
  twitterHandle?: string;
};

export type CommandItem = {
  id: string;
  label: string;
  hint: string;
  href: string;
  external?: boolean;
};

export type SiteSettings = {
  profile: Profile;
  social: Social;
  navItems: NavItem[];
  seo: SeoSettings;
};

export type SiteContent = {
  profile: Profile;
  social: Social;
  navItems: NavItem[];
  seo: SeoSettings;
  projects: Project[];
  experience: Experience[];
  skillCategories: SkillCategory[];
  principles: Principle[];
  industries: Industry[];
  architecture: ArchitectureContent;
  openSourceProjects: OpenSourceProject[];
  commands: CommandItem[];
};
