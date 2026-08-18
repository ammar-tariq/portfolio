// Placeholder/example data — the real architecture content is served from
// MongoDB. These generic diagrams back the homepage architecture/AI sections.
export type GraphNode = {
  id: string;
  label: string;
  layer: number;
  detail?: string;
};

export const identityGraph = {
  root: { id: "engineer", label: "Software Engineer", detail: "Product, systems, and delivery." },
  branches: [
    {
      id: "frontend",
      label: "Frontend",
      detail: "React, Next.js, TypeScript.",
      children: ["React", "Next.js", "TypeScript"],
    },
    {
      id: "mobile",
      label: "Mobile",
      detail: "React Native and store delivery.",
      children: ["React Native", "Expo", "Native Modules"],
    },
    {
      id: "backend",
      label: "Backend",
      detail: "Node.js, NestJS, REST, GraphQL.",
      children: ["Node.js", "NestJS", "GraphQL"],
    },
    {
      id: "ai",
      label: "AI",
      detail: "LLM integrations, agents, automation.",
      children: ["LLMs", "Agents", "RAG"],
    },
  ],
  foundation: {
    id: "architecture",
    label: "System Architecture",
    detail: "Boundaries, contracts, and data.",
  },
} as const;

export const systemArchitecture = [
  {
    id: "clients",
    label: "Clients",
    children: [
      { id: "web", label: "React Web", detail: "Product UIs and dashboards." },
      { id: "native", label: "React Native", detail: "iOS / Android apps." },
    ],
  },
  {
    id: "api",
    label: "API Layer",
    detail: "Typed contracts. REST or GraphQL.",
    children: [{ id: "server", label: "Node / NestJS", detail: "Domain services and gateways." }],
  },
  {
    id: "data",
    label: "Data",
    children: [
      { id: "pg", label: "PostgreSQL", detail: "Relational source of truth." },
      { id: "mongo", label: "MongoDB", detail: "Document workloads." },
      { id: "redis", label: "Redis", detail: "Cache and coordination." },
    ],
  },
  {
    id: "cloud",
    label: "Cloud / Infra",
    detail: "Docker, Nginx, Linux, CI/CD.",
  },
] as const;

export const aiPipeline = [
  { id: "user", label: "User", detail: "Intent and the job to be done." },
  { id: "app", label: "Application", detail: "Product surface that owns UX, auth, and state." },
  { id: "orch", label: "AI Orchestration", detail: "Prompting, tools, routing, structured outputs." },
  { id: "llm", label: "LLM", detail: "Hosted APIs or local models." },
  { id: "tools", label: "Tools / APIs / Data", detail: "Retrieval, actions, and databases." },
  { id: "result", label: "Result", detail: "A useful artifact the user can trust." },
] as const;

export const aiConcepts = [
  { id: "llm", label: "LLM integrations", body: "Product features that call models with structured outputs." },
  { id: "products", label: "AI-powered products", body: "Workflows where the model is in the product, with a human-owned action boundary." },
  { id: "local", label: "Local AI", body: "On-device agents and local inference for sensitive work." },
  { id: "automation", label: "AI automation", body: "Repetitive drafting and classification with a human in the loop." },
  { id: "structured", label: "Structured outputs", body: "Schemas over prose for anything used downstream." },
  { id: "retrieval", label: "Retrieval", body: "Grounding generation in real documents and data." },
  { id: "agents", label: "Agents", body: "Tool-using loops that prepare work and propose actions." },
  { id: "tooling", label: "Developer tooling", body: "Code review and internal agents that speed up delivery." },
] as const;
