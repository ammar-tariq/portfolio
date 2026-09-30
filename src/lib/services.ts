import type { Project } from "@/types/content";
import { publicProjects } from "@/lib/project-helpers";

export type ServiceDefinition = {
  id: string;
  title: string;
  summary: string;
  match: (technologies: string[]) => boolean;
};

function hasTech(technologies: string[], pattern: RegExp) {
  return technologies.some((tech) => pattern.test(tech.trim()));
}

export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    id: "react-native",
    title: "React Native development",
    summary:
      "iOS and Android products in React Native and Expo, including the TypeScript UI, the API contract, and the store release. This is the mobile work, not a separate native-only practice.",
    match: (technologies) => hasTech(technologies, /^(react native|expo)$/i),
  },
  {
    id: "react",
    title: "React development",
    summary:
      "React and Next.js for admin tools, web apps, and product surfaces that sit next to the mobile client. A project listed here uses React on the web, not only React Native.",
    match: (technologies) => hasTech(technologies, /^(react|next\.js|nextjs)$/i),
  },
  {
    id: "node",
    title: "Node.js and full-stack development",
    summary:
      "Node.js services — NestJS and Express — that the mobile and web clients call. Full-stack here means the same person owns the client and the API, not a slide that says both.",
    match: (technologies) => hasTech(technologies, /^(node\.js|node|nestjs|express)$/i),
  },
  {
    id: "ai",
    title: "AI and LLM integration",
    summary:
      "LLM features inside a product: recommendations, conversation, and the backend that has to stay reliable when the model is slow or wrong. Only projects that actually name that stack are listed.",
    match: (technologies) => hasTech(technologies, /openai|\bllm\b|\bgpt\b/i),
  },
];

export function projectsForService(projects: Project[], service: ServiceDefinition) {
  return publicProjects(projects).filter((project) => service.match(project.technologies));
}

export function serviceAnchorForTechnology(tech: string) {
  const service = SERVICE_DEFINITIONS.find((item) => item.match([tech]));
  return service?.id;
}
