export type GraphNode = {
  id: string;
  label: string;
  layer: number;
  detail?: string;
};

export const identityGraph = {
  "root": {
    "id": "engineer",
    "label": "Software Engineer",
    "detail": "Product, systems, and delivery."
  },
  "branches": [
    {
      "id": "frontend",
      "label": "Frontend",
      "detail": "React, Next.js, TypeScript, Redux Toolkit.",
      "children": [
        "React",
        "Next.js",
        "TypeScript"
      ]
    },
    {
      "id": "mobile",
      "label": "Mobile",
      "detail": "React Native, native modules, production store delivery.",
      "children": [
        "React Native",
        "Expo",
        "Native Modules"
      ]
    },
    {
      "id": "backend",
      "label": "Backend",
      "detail": "Node.js, NestJS, REST, GraphQL, realtime.",
      "children": [
        "Node.js",
        "NestJS",
        "GraphQL"
      ]
    },
    {
      "id": "ai",
      "label": "AI",
      "detail": "LLM integrations, agents, local inference, automation.",
      "children": [
        "LLMs",
        "Agents",
        "RAG"
      ]
    }
  ],
  "foundation": {
    "id": "architecture",
    "label": "System Architecture",
    "detail": "Boundaries, contracts, data, and the restraint to not overbuild."
  }
} as const;

export const systemArchitecture = [
  {
    "id": "clients",
    "label": "Clients",
    "children": [
      {
        "id": "web",
        "label": "React Web",
        "detail": "Product UIs, dashboards, marketing surfaces."
      },
      {
        "id": "native",
        "label": "React Native",
        "detail": "iOS / Android with native modules when the OS demands it."
      }
    ]
  },
  {
    "id": "api",
    "label": "API Layer",
    "detail": "Typed contracts. REST or GraphQL. Auth at the edge of the system.",
    "children": [
      {
        "id": "server",
        "label": "Node / NestJS",
        "detail": "Domain services, validation, realtime gateways."
      }
    ]
  },
  {
    "id": "data",
    "label": "Data",
    "children": [
      {
        "id": "pg",
        "label": "PostgreSQL",
        "detail": "Relational source of truth."
      },
      {
        "id": "mongo",
        "label": "MongoDB",
        "detail": "Document workloads and evolving schemas."
      },
      {
        "id": "redis",
        "label": "Redis",
        "detail": "Cache, presence, short-lived coordination."
      }
    ]
  },
  {
    "id": "cloud",
    "label": "Cloud / Infra",
    "detail": "Docker, Nginx, PM2, Linux, CI/CD, GCP."
  }
] as const;

export const aiPipeline = [
  {
    "id": "user",
    "label": "User",
    "detail": "Intent, context, and the job to be done."
  },
  {
    "id": "app",
    "label": "Application",
    "detail": "Product surface that owns UX, auth, and state."
  },
  {
    "id": "orch",
    "label": "AI Orchestration",
    "detail": "Prompting, tools, routing, structured outputs."
  },
  {
    "id": "llm",
    "label": "LLM",
    "detail": "Hosted APIs or local models — chosen per constraint."
  },
  {
    "id": "tools",
    "label": "Tools / APIs / Data",
    "detail": "Retrieval, actions, databases — the model is not the system."
  },
  {
    "id": "result",
    "label": "Result",
    "detail": "A useful artifact the user can trust, inspect, or approve."
  }
] as const;

export const aiConcepts = [
  {
    "id": "llm",
    "label": "LLM integrations",
    "body": "Product features that call models with structured outputs — not chatbot chrome bolted on."
  },
  {
    "id": "products",
    "label": "AI-powered products",
    "body": "Consumer and internal workflows where the model is in the product — recommendations, drafts, and automation with a human-owned action boundary."
  },
  {
    "id": "local",
    "label": "Local AI",
    "body": "On-device agents and local inference so sensitive work never has to leave the machine."
  },
  {
    "id": "automation",
    "label": "AI automation",
    "body": "Repetitive drafting and classification, always with a human-owned action boundary."
  },
  {
    "id": "structured",
    "label": "Structured outputs",
    "body": "Schemas over prose. If it cannot be typed, it cannot be trusted downstream."
  },
  {
    "id": "retrieval",
    "label": "Retrieval",
    "body": "Grounding generation in documents, listings, or profile data rather than hope."
  },
  {
    "id": "agents",
    "label": "Agents",
    "body": "Tool-using loops that prepare work. They propose; they do not silently commit."
  },
  {
    "id": "tooling",
    "label": "Developer tooling",
    "body": "Code review, spec generation, and internal agents that shorten the path from idea to diff."
  }
] as const;
