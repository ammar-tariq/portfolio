import { profile as profileData } from "@/data/profile";
import { navItems as navData, social as socialData } from "@/data/social";
import { projects as projectData } from "@/data/projects";
import { experience as experienceData } from "@/data/experience";
import { skillCategories as skillData } from "@/data/skills";
import { principles as principleData } from "@/data/philosophy";
import { industries as industryData } from "@/data/industries";
import {
  aiConcepts,
  aiPipeline,
  identityGraph,
  systemArchitecture,
} from "@/data/architecture";
import { githubConfig, openSourceProjects } from "@/data/github";
import { seoKeywords, seoTopics } from "@/data/seo-keywords";
import { rewriteProjectMedia } from "@/lib/media-url";
import type {
  ArchitectureContent,
  Project,
  SiteContent,
  SiteSettings,
} from "@/types/content";

// Placeholder — real values are served from MongoDB (see src/lib/content.ts).
const aboutBody =
  "A short 'about' paragraph describing how you work and the through-line across your projects. The live site loads this from the database; this is placeholder copy for the public repo.";

export function staticSettings(): SiteSettings {
  return {
    profile: {
      name: profileData.name,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      title: profileData.title,
      headline: profileData.headline,
      summary: profileData.summary,
      location: profileData.location,
      availability: profileData.availability,
      yearsExperience: profileData.yearsExperience,
      email: profileData.email,
      resumeUrl: profileData.resumeUrl,
      website: profileData.website,
      focus: [...profileData.focus],
      aboutHeadline: `${profileData.yearsExperience}+ years building products that have to last.`,
      aboutBody,
    },
    social: { ...socialData },
    navItems: navData.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      external: "external" in item ? item.external : undefined,
    })),
    seo: {
      title: `${profileData.name} | ${profileData.title}`,
      description: profileData.summary,
      keywords: [...seoKeywords],
      topics: [...seoTopics],
    },
  };
}

export function staticArchitecture(): ArchitectureContent {
  return JSON.parse(
    JSON.stringify({
      identityGraph,
      systemArchitecture,
      aiPipeline,
      aiConcepts,
    }),
  ) as ArchitectureContent;
}

export function staticContent(): SiteContent {
  const settings = staticSettings();
  return {
    profile: settings.profile,
    social: settings.social,
    navItems: settings.navItems,
    seo: settings.seo,
    projects: (projectData as Project[]).map(rewriteProjectMedia),
    experience: experienceData.map((item, index) => ({ ...item, sortOrder: index })),
    skillCategories: skillData.map((item, index) => ({ ...item, sortOrder: index })),
    principles: principleData.map((item, index) => ({ ...item, sortOrder: index })),
    industries: industryData.map((item) => ({ id: item.id, label: item.label })),
    architecture: staticArchitecture(),
    openSourceProjects: openSourceProjects.map((item, index) => ({ ...item, sortOrder: index })),
    commands: [
      { id: "portfolio", label: "View portfolio", hint: "Case studies", href: "/portfolio" },
      { id: "open-source", label: "Open source", hint: "Public repositories", href: "/open-source" },
      { id: "experience", label: "View Experience", hint: "Career timeline", href: "/experience" },
      { id: "skills", label: "View Skills", hint: "Technology ecosystem", href: "/skills" },
      { id: "about", label: "About", hint: "Profile", href: "/about" },
      { id: "blogs", label: "Blogs", hint: "Medium", href: settings.social.medium, external: true },
      { id: "contact", label: "Contact", hint: "Start a conversation", href: "/contact" },
      { id: "ai", label: "AI Systems", hint: "LLM orchestration", href: "/ai" },
      { id: "architecture", label: "Architecture", hint: "System map", href: "/architecture" },
      {
        id: "github",
        label: "GitHub",
        hint: githubConfig.username,
        href: settings.social.github,
        external: true,
      },
      { id: "whatsapp", label: "WhatsApp", hint: "Message on WhatsApp", href: settings.social.whatsapp, external: true },
      { id: "calendly", label: "Book a meeting", hint: "Calendly", href: settings.social.calendly, external: true },
      { id: "upwork", label: "Upwork", hint: "Hire on Upwork", href: settings.social.upwork, external: true },
      { id: "linkedin", label: "LinkedIn", hint: "Professional profile", href: settings.social.linkedin, external: true },
      { id: "resume", label: "Resume", hint: "Printable overview", href: "/resume" },
      { id: "email", label: "Email", hint: settings.profile.email, href: `mailto:${settings.profile.email}`, external: true },
      { id: "theme", label: "Toggle theme", hint: "Light / dark", href: "action:theme" },
    ],
  };
}
