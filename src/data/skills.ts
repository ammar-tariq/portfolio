export type SkillCategory = {
  id: string;
  label: string;
  summary: string;
  items: { name: string; note?: string }[];
};

// Placeholder/example data — the real skill set is served from MongoDB.
export const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    label: "Frontend",
    summary: "Product-grade interfaces with TypeScript, careful state, and dependable performance.",
    items: [
      { name: "React" },
      { name: "Next.js" },
      { name: "TypeScript" },
      { name: "Redux Toolkit" },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    summary: "Cross-platform apps with native integrations and store delivery.",
    items: [
      { name: "React Native" },
      { name: "Expo" },
      { name: "React Navigation" },
      { name: "Firebase" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    summary: "APIs and real-time services designed as contracts.",
    items: [
      { name: "Node.js" },
      { name: "Express" },
      { name: "NestJS" },
      { name: "GraphQL" },
      { name: "Socket.io" },
    ],
  },
  {
    id: "databases",
    label: "Databases",
    summary: "Data models chosen for the product: relational, document, or cache.",
    items: [{ name: "PostgreSQL" }, { name: "MongoDB" }, { name: "Redis" }],
  },
  {
    id: "cloud",
    label: "Cloud / Infra",
    summary: "Deployment and pipelines that make releases boring.",
    items: [{ name: "Docker" }, { name: "Nginx" }, { name: "CI/CD" }, { name: "Linux" }],
  },
  {
    id: "ai",
    label: "AI",
    summary: "Applied LLM systems in products — orchestration, tools, and local inference.",
    items: [
      { name: "LLM integrations" },
      { name: "AI agents" },
      { name: "RAG concepts" },
    ],
  },
];
