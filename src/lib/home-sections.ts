import type { SiteContent } from "@/types/content";

export type HomeSectionId =
  | "hero"
  | "about"
  | "faq"
  | "portfolio"
  | "open-source"
  | "experience"
  | "skills"
  | "identity"
  | "architecture"
  | "ai"
  | "philosophy"
  | "contact";

export type HomeSection = {
  id: HomeSectionId;
  path: string;
  label: string;
  title: string;
  description: (content: SiteContent) => string;
};

export const HOME_SECTIONS: HomeSection[] = [
  {
    id: "hero",
    path: "/",
    label: "Home",
    title: "",
    description: (content) => content.seo.description,
  },
  {
    id: "about",
    path: "/about",
    label: "About",
    title: "About",
    description: (content) => content.profile.aboutBody || content.profile.summary,
  },
  {
    id: "faq",
    path: "/faq",
    label: "FAQ",
    title: "FAQ",
    description: (content) => `Questions about ${content.profile.name}, availability, and how to get in touch.`,
  },
  {
    id: "portfolio",
    path: "/portfolio",
    label: "Portfolio",
    title: "Portfolio",
    description: (content) =>
      `Selected engineering work by ${content.profile.name} — case studies across mobile, web, backend, and AI.`,
  },
  {
    id: "open-source",
    path: "/open-source",
    label: "Open source",
    title: "Open source",
    description: (content) => `Open-source projects and public repositories by ${content.profile.name}.`,
  },
  {
    id: "experience",
    path: "/experience",
    label: "Experience",
    title: "Experience",
    description: (content) =>
      `Career history of ${content.profile.name}, ${content.profile.title} — roles, companies, and the systems behind them.`,
  },
  {
    id: "skills",
    path: "/skills",
    label: "Skills",
    title: "Skills",
    description: (content) =>
      `Technical expertise of ${content.profile.name}: ${content.skillCategories
        .map((category) => category.label)
        .join(", ")}.`,
  },
  {
    id: "identity",
    path: "/identity",
    label: "Practice",
    title: "Practice",
    description: (content) =>
      `How ${content.profile.name} works across mobile, web, backend, and AI — held together by architecture.`,
  },
  {
    id: "architecture",
    path: "/architecture",
    label: "Architecture",
    title: "Architecture",
    description: (content) =>
      `System architecture from ${content.profile.name}: clients, APIs, data, and infrastructure as one map.`,
  },
  {
    id: "ai",
    path: "/ai",
    label: "AI systems",
    title: "AI systems",
    description: (content) => `LLM-integrated product work and AI systems by ${content.profile.name}.`,
  },
  {
    id: "philosophy",
    path: "/philosophy",
    label: "Philosophy",
    title: "Philosophy",
    description: (content) => `Engineering principles and working philosophy of ${content.profile.name}.`,
  },
  {
    id: "contact",
    path: "/contact",
    label: "Contact",
    title: "Contact",
    description: (content) =>
      `Contact ${content.profile.name} — ${content.profile.title} based in ${content.profile.location}. ${content.profile.availability}.`,
  },
];

const byId = new Map(HOME_SECTIONS.map((section) => [section.id, section]));
const byPath = new Map(HOME_SECTIONS.map((section) => [section.path, section]));

export function homeSectionById(id: string): HomeSection | undefined {
  return byId.get(id as HomeSectionId);
}

export function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function homeSectionFromPathname(pathname: string): HomeSection | undefined {
  return byPath.get(normalizePathname(pathname));
}

export function homeSectionFromHref(href: string): HomeSection | undefined {
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("action:")) {
    return undefined;
  }
  if (href.startsWith("#")) {
    return homeSectionById(href.slice(1).split(/[?&]/)[0] ?? "");
  }
  try {
    const url = new URL(href, "https://local.invalid");
    return homeSectionFromPathname(url.pathname);
  } catch {
    return undefined;
  }
}

export function isHomeShellPath(pathname: string) {
  return Boolean(homeSectionFromPathname(pathname));
}

/** Turn stored `#experience` (or mixed admin input) into a crawlable path. */
export function canonicalizeSectionHref(href: string) {
  return homeSectionFromHref(href)?.path ?? href;
}

export function homeSectionSlugs() {
  return HOME_SECTIONS.filter((section) => section.path !== "/").map((section) => section.path.slice(1));
}
