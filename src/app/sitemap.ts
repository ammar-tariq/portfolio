import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content";
import { siteUrlFrom } from "@/lib/seo";
import { publicProjects } from "@/lib/project-helpers";
import { LEGAL_UPDATED_ISO } from "@/lib/legal";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getSiteContent();
  const siteUrl = siteUrlFrom(content);
  const projects = publicProjects(content.projects);

  // Use real content timestamps. A lastmod that changes on every request
  // teaches crawlers to ignore it.
  const projectDates = projects
    .map((project) => (project.updatedAt ? new Date(project.updatedAt) : undefined))
    .filter((date): date is Date => Boolean(date));
  const latestUpdate = projectDates.length
    ? new Date(Math.max(...projectDates.map((date) => date.getTime())))
    : undefined;
  const legalUpdated = new Date(`${LEGAL_UPDATED_ISO}T00:00:00.000Z`);

  const work = projects.map((project) => ({
    url: `${siteUrl}/work/${project.slug}`,
    ...(project.updatedAt ? { lastModified: new Date(project.updatedAt) } : {}),
    changeFrequency: "monthly" as const,
    priority: project.featured ? 0.8 : 0.6,
  }));

  return [
    {
      url: siteUrl,
      ...(latestUpdate ? { lastModified: latestUpdate } : {}),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/work`,
      ...(latestUpdate ? { lastModified: latestUpdate } : {}),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/resume`,
      ...(latestUpdate ? { lastModified: latestUpdate } : {}),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: legalUpdated,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: legalUpdated,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...work,
  ];
}
