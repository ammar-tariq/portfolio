import { type IndustryId } from "@/data/industries";

export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption?: string;
};

export type Project = {
  slug: string;
  title: string;
  /** Brand-free label for metadata, JSON-LD, and LLM/crawler text. */
  seoLabel: string;
  /** Brand-free summary for metadata and structured data. */
  seoDescription: string;
  tagline: string;
  description: string;
  industries: IndustryId[];
  role: string;
  year?: string;
  status?: "shipped" | "active" | "internal";
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
  logo?: string;
  applicationCategory?: string;
  visual: "dojo" | "glass" | "signal" | "frame" | "hub" | "map" | "orbit" | "horizon" | "catalog";
};

export function projectLiveLabel(project: Project) {
  return project.liveLabel ?? "Live";
}

// Placeholder/example data — the real case studies are served from MongoDB (see
// src/lib/content.ts). These two examples keep the app buildable and give anyone
// forking the repo a template. Real project details never live in the repo.
export const projects: Project[] = [
  {
    slug: "example-mobile-app",
    title: "Example Mobile App",
    seoLabel: "Example React Native mobile app case study",
    seoDescription:
      "A production React Native app example — replace this with a brand-free summary of the product and outcome.",
    tagline: "A one-line description of the product.",
    description:
      "A longer paragraph describing the product, the problem it solves, and who it is for. The live site loads real case studies from the database; this is placeholder copy for the public repo.",
    industries: ["mobile", "marketplace"],
    role: "Full-stack engineer · React Native and APIs",
    year: "2025",
    status: "shipped",
    featured: true,
    listed: true,
    technologies: ["React Native", "TypeScript", "Node.js", "REST APIs"],
    challenge:
      "Describe the core problem and the constraints that made it hard.",
    solution:
      "Describe what you built and the key decisions behind it.",
    architecture: [
      "Client: React Native app with typed navigation",
      "API: Node.js services with REST contracts",
      "Data: a database chosen for the workload",
    ],
    engineering: [
      "A notable engineering decision and its result.",
      "Another decision that improved performance or reliability.",
    ],
    outcome: "Describe the measurable outcome — installs, ratings, or impact.",
    highlights: ["Full product delivery", "API integration", "Store release"],
    visual: "orbit",
  },
  {
    slug: "example-web-platform",
    title: "Example Web Platform",
    seoLabel: "Example web platform case study",
    seoDescription:
      "A full-stack web platform example — replace with a brand-free summary of the product and outcome.",
    tagline: "A one-line description of the platform.",
    description:
      "A longer paragraph describing the web platform, its users, and the value it delivers.",
    industries: ["web", "saas"],
    role: "Full-stack engineer · Next.js and backend",
    year: "2024",
    status: "shipped",
    featured: true,
    listed: true,
    technologies: ["Next.js", "TypeScript", "NestJS", "PostgreSQL"],
    challenge: "Describe the core problem this platform solved.",
    solution: "Describe the architecture and the product decisions.",
    architecture: [
      "Frontend: Next.js app with server rendering",
      "Backend: NestJS services and typed contracts",
      "Data: PostgreSQL as the source of truth",
    ],
    engineering: [
      "A notable engineering or architecture decision.",
      "Another decision that improved the product.",
    ],
    outcome: "Describe the measurable outcome or adoption.",
    highlights: ["Full-stack delivery", "Server-rendered UI", "Typed APIs"],
    visual: "hub",
  },
];
