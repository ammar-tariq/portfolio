import { cache } from "react";
import { unstable_cache } from "next/cache";
import { connectDb } from "@/lib/db";
import { hasMongo } from "@/lib/env";
import {
  ArchitectureModel,
  ExperienceModel,
  IndustryModel,
  OpenSourceModel,
  PrincipleModel,
  ProjectModel,
  SettingsModel,
  SkillCategoryModel,
} from "@/models";
import { staticContent } from "@/lib/static-content";
import { canonicalizeSectionHref } from "@/lib/home-sections";
import { BLOG_PATH } from "@/lib/blog";
import { resolveMediaUrl, rewriteProjectMedia } from "@/lib/media-url";
import { isResumeTemplateId } from "@/lib/resume-templates/types";
import type {
  ArchitectureContent,
  CommandItem,
  Experience,
  Industry,
  NavItem,
  OpenSourceProject,
  Principle,
  Project,
  ProjectScreenshot,
  SiteContent,
  SiteSettings,
  SkillCategory,
} from "@/types/content";

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asRecord(doc: unknown): Record<string, unknown> {
  return serialize(doc) as Record<string, unknown>;
}

function str(value: unknown) {
  return value == null ? "" : String(value);
}

function strList(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function screenshotList(value: unknown): ProjectScreenshot[] {
  if (!Array.isArray(value)) return [];
  return value.map((shot) => {
    const item = asRecord(shot);
    return {
      src: str(item.src),
      alt: str(item.alt),
      caption: item.caption ? str(item.caption) : undefined,
      publicId: item.publicId ? str(item.publicId) : undefined,
    };
  }).filter((shot) => shot.src);
}

function projectFromDoc(doc: unknown): Project {
  const data = asRecord(doc);
  const iosScreenshots = screenshotList(data.iosScreenshots);
  const androidScreenshots = screenshotList(data.androidScreenshots);
  const screenshots = screenshotList(data.screenshots);
  return {
    slug: str(data.slug),
    title: str(data.title),
    seoLabel: str(data.seoLabel || data.title),
    seoDescription: str(data.seoDescription),
    tagline: str(data.tagline),
    description: str(data.description),
    industries: strList(data.industries),
    role: str(data.role),
    year: data.year ? str(data.year) : undefined,
    status: (data.status as Project["status"]) ?? "shipped",
    featured: Boolean(data.featured),
    listed: data.listed !== false,
    technologies: strList(data.technologies),
    github: data.github ? str(data.github) : undefined,
    liveUrl: data.liveUrl ? str(data.liveUrl) : undefined,
    liveLabel: data.liveLabel ? str(data.liveLabel) : undefined,
    appStoreUrl: data.appStoreUrl ? str(data.appStoreUrl) : undefined,
    webUrl: data.webUrl ? str(data.webUrl) : undefined,
    webLabel: data.webLabel ? str(data.webLabel) : undefined,
    challenge: data.challenge ? str(data.challenge) : undefined,
    solution: data.solution ? str(data.solution) : undefined,
    architecture: strList(data.architecture),
    engineering: strList(data.engineering),
    outcome: data.outcome ? str(data.outcome) : undefined,
    highlights: strList(data.highlights),
    screenshots,
    iosScreenshots,
    androidScreenshots,
    logo: data.logo ? str(data.logo) : undefined,
    logoPublicId: data.logoPublicId ? str(data.logoPublicId) : undefined,
    banner: data.banner ? str(data.banner) : undefined,
    bannerPublicId: data.bannerPublicId ? str(data.bannerPublicId) : undefined,
    video: data.video ? str(data.video) : undefined,
    videoPublicId: data.videoPublicId ? str(data.videoPublicId) : undefined,
    videoUrl: data.videoUrl ? str(data.videoUrl) : undefined,
    ogImage: data.ogImage ? str(data.ogImage) : undefined,
    ogImagePublicId: data.ogImagePublicId ? str(data.ogImagePublicId) : undefined,
    applicationCategory: data.applicationCategory ? str(data.applicationCategory) : undefined,
    visual: (data.visual as Project["visual"]) ?? "orbit",
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    updatedAt: data.updatedAt ? str(data.updatedAt) : undefined,
  };
}

function experienceFromDoc(doc: unknown): Experience {
  const data = asRecord(doc);
  return {
    id: str(data.id),
    role: str(data.role),
    company: str(data.company),
    period: str(data.period),
    year: str(data.year),
    location: data.location ? str(data.location) : undefined,
    summary: str(data.summary),
    technologies: strList(data.technologies),
    responsibilities: strList(data.responsibilities),
    projects: strList(data.projects),
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
  };
}

function skillFromDoc(doc: unknown): SkillCategory {
  const data = asRecord(doc);
  const items = Array.isArray(data.items) ? data.items : [];
  return {
    id: str(data.id),
    label: str(data.label),
    summary: str(data.summary),
    items: items.map((item) => {
      const entry = asRecord(item);
      return { name: str(entry.name), note: entry.note ? str(entry.note) : undefined };
    }),
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
  };
}

function principleFromDoc(doc: unknown): Principle {
  const data = asRecord(doc);
  return {
    id: str(data.id),
    title: str(data.title),
    statement: str(data.statement),
    body: str(data.body),
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
  };
}

function industryFromDoc(doc: unknown): Industry {
  const data = asRecord(doc);
  return { id: str(data.id), label: str(data.label) };
}

function openSourceFromDoc(doc: unknown): OpenSourceProject {
  const data = asRecord(doc);
  return {
    slug: str(data.slug),
    title: str(data.title),
    description: str(data.description),
    repoUrl: str(data.repoUrl),
    demoUrl: data.demoUrl ? str(data.demoUrl) : undefined,
    demoLabel: data.demoLabel ? str(data.demoLabel) : undefined,
    language: str(data.language),
    topics: strList(data.topics),
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
  };
}

function settingsFromDoc(doc: unknown): SiteSettings {
  const data = asRecord(doc);
  const fallback = staticContent();
  const profile = { ...fallback.profile, ...(data.profile as SiteSettings["profile"] | undefined) };
  const seo = { ...fallback.seo, ...(data.seo as SiteSettings["seo"] | undefined) };
  const defaultResumeTemplate = isResumeTemplateId(data.defaultResumeTemplate)
    ? data.defaultResumeTemplate
    : fallback.defaultResumeTemplate ?? "classic";
  return {
    profile: {
      ...profile,
      phone: typeof profile.phone === "string" ? profile.phone : fallback.profile.phone ?? "",
      photoUrl: resolveMediaUrl(profile.photoUrl, profile.photoPublicId) ?? profile.photoUrl,
    },
    social: { ...fallback.social, ...(data.social as SiteSettings["social"] | undefined) },
    navItems: Array.isArray(data.navItems) ? (data.navItems as SiteSettings["navItems"]) : fallback.navItems,
    seo: {
      ...seo,
      defaultOgImage: resolveMediaUrl(seo.defaultOgImage, seo.defaultOgImagePublicId) ?? seo.defaultOgImage,
    },
    defaultResumeTemplate,
  };
}

function architectureFromDoc(doc: unknown | null): ArchitectureContent {
  const fallback = staticContent().architecture;
  if (!doc) return fallback;
  const data = asRecord(doc);
  return {
    identityGraph: (data.identityGraph as ArchitectureContent["identityGraph"]) ?? fallback.identityGraph,
    systemArchitecture:
      (data.systemArchitecture as ArchitectureContent["systemArchitecture"]) ?? fallback.systemArchitecture,
    aiPipeline: (data.aiPipeline as ArchitectureContent["aiPipeline"]) ?? fallback.aiPipeline,
    aiConcepts: (data.aiConcepts as ArchitectureContent["aiConcepts"]) ?? fallback.aiConcepts,
  };
}

function buildCommands(settings: SiteSettings): CommandItem[] {
  const { profile, social } = settings;
  return [
    { id: "portfolio", label: "View portfolio", hint: "Case studies", href: "/portfolio" },
    { id: "open-source", label: "Open source", hint: "Public repositories", href: "/open-source" },
    { id: "experience", label: "View Experience", hint: "Career timeline", href: "/experience" },
    { id: "skills", label: "View Skills", hint: "Technology ecosystem", href: "/skills" },
    { id: "about", label: "About", hint: "Profile", href: "/about" },
    { id: "blogs", label: "Blogs", hint: "Medium", href: BLOG_PATH },
    { id: "contact", label: "Contact", hint: "Start a conversation", href: "/contact" },
    { id: "ai", label: "AI Systems", hint: "LLM orchestration", href: "/ai" },
    { id: "architecture", label: "Architecture", hint: "System map", href: "/architecture" },
    { id: "github", label: "GitHub", hint: social.githubHandle, href: social.github, external: true },
    { id: "whatsapp", label: "WhatsApp", hint: "Message on WhatsApp", href: social.whatsapp, external: true },
    { id: "calendly", label: "Book a meeting", hint: "Calendly", href: social.calendly, external: true },
    { id: "upwork", label: "Upwork", hint: "Hire on Upwork", href: social.upwork, external: true },
    { id: "linkedin", label: "LinkedIn", hint: "Professional profile", href: social.linkedin, external: true },
    { id: "resume", label: "Resume", hint: "Printable overview", href: profile.resumeUrl || "/resume" },
    { id: "email", label: "Email", hint: profile.email, href: `mailto:${profile.email}`, external: true },
    { id: "theme", label: "Toggle theme", hint: "Light / dark", href: "action:theme" },
  ];
}

function normalizeNavItem(item: NavItem, medium: string): NavItem {
  const isBlog =
    item.id === "blogs" ||
    item.id === "blog" ||
    item.href === BLOG_PATH ||
    (Boolean(medium) && item.href === medium);
  if (isBlog) return { ...item, href: BLOG_PATH, external: false };
  if (item.external) return item;
  return { ...item, href: canonicalizeSectionHref(item.href) };
}

function assemble(parts: {
  settings: SiteSettings;
  projects: Project[];
  experience: Experience[];
  skillCategories: SkillCategory[];
  principles: Principle[];
  industries: Industry[];
  architecture: ArchitectureContent;
  openSourceProjects: OpenSourceProject[];
}): SiteContent {
  return {
    ...parts,
    profile: parts.settings.profile,
    social: parts.settings.social,
    navItems: parts.settings.navItems.map((item) => normalizeNavItem(item, parts.settings.social.medium)),
    seo: parts.settings.seo,
    defaultResumeTemplate: parts.settings.defaultResumeTemplate ?? "classic",
    commands: buildCommands(parts.settings),
  };
}

async function loadFromMongo(): Promise<SiteContent> {
  await connectDb();
  const [settingsDoc, projects, experience, skillCategories, principles, industries, architectureDoc, openSource] =
    await Promise.all([
      SettingsModel.findById("site").lean(),
      ProjectModel.find().sort({ sortOrder: 1, createdAt: 1 }).lean(),
      ExperienceModel.find().sort({ sortOrder: 1 }).lean(),
      SkillCategoryModel.find().sort({ sortOrder: 1 }).lean(),
      PrincipleModel.find().sort({ sortOrder: 1 }).lean(),
      IndustryModel.find().sort({ sortOrder: 1 }).lean(),
      ArchitectureModel.findById("architecture").lean(),
      OpenSourceModel.find().sort({ sortOrder: 1 }).lean(),
    ]);

  if (!settingsDoc || projects.length === 0) {
    return staticContent();
  }

  return serialize(
    assemble({
      settings: settingsFromDoc(settingsDoc),
      projects: projects.map((doc) => rewriteProjectMedia(projectFromDoc(doc))),
      experience: experience.map(experienceFromDoc),
      skillCategories: skillCategories.map(skillFromDoc),
      principles: principles.map(principleFromDoc),
      industries: industries.map(industryFromDoc),
      architecture: architectureFromDoc(architectureDoc),
      openSourceProjects: openSource.map(openSourceFromDoc),
    }),
  );
}

async function loadContent(): Promise<SiteContent> {
  if (!hasMongo()) return staticContent();
  try {
    return await loadFromMongo();
  } catch (error) {
    console.error("Failed to load site content from MongoDB, using static fallback.", error);
    return staticContent();
  }
}

const loadCachedContent = unstable_cache(loadContent, ["site-content"], {
  revalidate: 120,
  tags: ["site-content"],
});

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  return loadCachedContent();
});

export async function getSiteContentForParams() {
  return loadContent();
}

export async function getPublicProject(slug: string) {
  const content = await getSiteContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project || project.listed === false || project.status === "internal") return null;
  return { project, content };
}
