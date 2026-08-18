import type { Industry, Project } from "@/types/content";

export function projectLiveLabel(project: Project) {
  return project.liveLabel ?? "Live";
}

export function listedProjects(projects: Project[]) {
  return projects.filter((project) => project.listed !== false);
}

export function featuredProjects(projects: Project[]) {
  return listedProjects(projects).filter((project) => project.featured);
}

export function publicProjects(projects: Project[]) {
  return listedProjects(projects).filter((project) => project.status !== "internal");
}

export function getProject(projects: Project[], slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function industryLabels(project: Project, industries: Industry[]) {
  return project.industries.map((id) => industries.find((item) => item.id === id)?.label ?? id);
}

export function industryLabel(project: Project, industries: Industry[]) {
  return industryLabels(project, industries).join(" · ");
}

export function projectHeroEyebrow(project: Project, industries: Industry[]) {
  return [industryLabel(project, industries), project.year, project.role.split("·")[0]?.trim()]
    .filter(Boolean)
    .join(" · ");
}

export function hasIndustry(project: Project, id: string) {
  return project.industries.includes(id);
}

export function activeIndustries(projects: Project[], industries: Industry[]) {
  const used = new Set(listedProjects(projects).flatMap((project) => project.industries));
  return industries.filter((industry) => used.has(industry.id));
}

export function relatedProjects(project: Project, projects: Project[], limit = 3) {
  const others = publicProjects(projects).filter((item) => item.slug !== project.slug);
  return others
    .map((item) => {
      const industries = item.industries.filter((id) => project.industries.includes(id)).length;
      const technologies = item.technologies.filter((tech) => project.technologies.includes(tech)).length;
      return {
        item,
        score: industries * 3 + technologies + (item.featured ? 1 : 0),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
