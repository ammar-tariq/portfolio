import type { SiteContent } from "@/types/content";
import { industryLabels, slugify } from "@/lib/project-helpers";
import { siteUrlFrom } from "@/lib/seo";

function compact<T extends Record<string, unknown>>(value: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry == null || entry === "") continue;
    if (Array.isArray(entry) && entry.length === 0) continue;
    out[key] = entry;
  }
  return out as T;
}

export function portfolioJsonFilename(content: SiteContent) {
  return `${slugify(content.profile.name) || "portfolio"}-portfolio.json`;
}

/** Facts-only snapshot of the live portfolio — no screenshots, IDs, or UI chrome. */
export function portfolioJson(content: SiteContent) {
  const siteUrl = siteUrlFrom(content);
  const { profile, social, seo } = content;

  return {
    generatedAt: new Date().toISOString(),
    siteUrl,
    instruction:
      "This JSON is the source of truth for this engineer's portfolio. Use only these facts for proposals, estimates, cover letters, and similar writing. Do not invent metrics, employers, dates, titles, degrees, or tools. Projects with listed=false or status=internal are not on the public site — treat them as confidential unless the task explicitly needs them.",
    profile: compact({
      name: profile.name,
      firstName: profile.firstName,
      lastName: profile.lastName,
      title: profile.title,
      headline: profile.headline,
      summary: profile.summary,
      aboutHeadline: profile.aboutHeadline,
      aboutBody: profile.aboutBody,
      location: profile.location,
      availability: profile.availability,
      yearsExperience: profile.yearsExperience,
      email: profile.email,
      phone: profile.phone,
      website: profile.website || siteUrl,
      resumeUrl: profile.resumeUrl ? new URL(profile.resumeUrl, siteUrl).toString() : `${siteUrl}/resume`,
      focus: profile.focus,
    }),
    social: compact({
      github: social.github,
      githubHandle: social.githubHandle,
      linkedin: social.linkedin,
      medium: social.medium,
      calendly: social.calendly,
      whatsapp: social.whatsapp,
      upwork: social.upwork,
      website: social.website,
      twitter: social.twitter,
    }),
    positioning: compact({
      title: seo.title,
      description: seo.description,
      topics: seo.topics,
    }),
    experience: content.experience.map((item) =>
      compact({
        role: item.role,
        company: item.company,
        period: item.period,
        year: item.year,
        location: item.location,
        summary: item.summary,
        technologies: item.technologies,
        responsibilities: item.responsibilities,
        projects: item.projects,
      }),
    ),
    skills: content.skillCategories.map((category) =>
      compact({
        label: category.label,
        summary: category.summary,
        items: category.items.map((item) => compact({ name: item.name, note: item.note })),
      }),
    ),
    projects: content.projects.map((project) =>
      compact({
        slug: project.slug,
        url: `${siteUrl}/work/${project.slug}`,
        title: project.title,
        tagline: project.tagline,
        description: project.description,
        seoDescription: project.seoDescription,
        industries: industryLabels(project, content.industries),
        role: project.role,
        year: project.year,
        status: project.status,
        featured: project.featured || undefined,
        listed: project.listed !== false,
        technologies: project.technologies,
        github: project.github,
        liveUrl: project.liveUrl,
        liveLabel: project.liveLabel,
        appStoreUrl: project.appStoreUrl,
        webUrl: project.webUrl,
        webLabel: project.webLabel,
        challenge: project.challenge,
        solution: project.solution,
        architecture: project.architecture,
        engineering: project.engineering,
        outcome: project.outcome,
        highlights: project.highlights,
        applicationCategory: project.applicationCategory,
      }),
    ),
    openSource: content.openSourceProjects.map((item) =>
      compact({
        title: item.title,
        description: item.description,
        language: item.language,
        topics: item.topics,
        repoUrl: item.repoUrl,
        demoUrl: item.demoUrl,
        demoLabel: item.demoLabel,
      }),
    ),
    principles: content.principles.map((item) =>
      compact({
        title: item.title,
        statement: item.statement,
        body: item.body,
      }),
    ),
    architecture: content.architecture,
    industries: content.industries.map((item) => item.label),
  };
}

export function portfolioJsonText(content: SiteContent) {
  return `${JSON.stringify(portfolioJson(content), null, 2)}\n`;
}
