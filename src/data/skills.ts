export type SkillCategory = {
  id: string;
  label: string;
  summary: string;
  items: { name: string; note?: string }[];
};

// Fallback skill set used when MongoDB is unavailable.
export const skillCategories: SkillCategory[] = 
[
  {
    "id": "frontend",
    "label": "Frontend",
    "summary": "Product-grade interfaces with TypeScript, careful state, and performance that holds up in production.",
    "items": [
      {
        "name": "React"
      },
      {
        "name": "Next.js"
      },
      {
        "name": "TypeScript"
      },
      {
        "name": "JavaScript"
      },
      {
        "name": "Redux Toolkit"
      },
      {
        "name": "RTK Query"
      }
    ]
  },
  {
    "id": "mobile",
    "label": "Mobile",
    "summary": "Cross-platform apps with native integrations, navigation architecture, and shipping to the stores.",
    "items": [
      {
        "name": "React Native"
      },
      {
        "name": "Expo"
      },
      {
        "name": "EAS"
      },
      {
        "name": "React Navigation"
      },
      {
        "name": "Native Modules"
      },
      {
        "name": "Firebase"
      }
    ]
  },
  {
    "id": "backend",
    "label": "Backend",
    "summary": "APIs and real-time services designed as contracts — not afterthoughts glued to the UI.",
    "items": [
      {
        "name": "Node.js"
      },
      {
        "name": "Express"
      },
      {
        "name": "NestJS"
      },
      {
        "name": "REST APIs"
      },
      {
        "name": "GraphQL"
      },
      {
        "name": "Socket.io"
      },
      {
        "name": "MQTT"
      },
      {
        "name": "Stripe"
      },
      {
        "name": "WebRTC"
      }
    ]
  },
  {
    "id": "databases",
    "label": "Databases",
    "summary": "Data models chosen for the product: transactional, document, or ephemeral cache.",
    "items": [
      {
        "name": "PostgreSQL"
      },
      {
        "name": "MongoDB"
      },
      {
        "name": "Redis"
      }
    ]
  },
  {
    "id": "cloud",
    "label": "Cloud / Infra",
    "summary": "Deployment, process management, and pipelines that make releases boring — in the best way.",
    "items": [
      {
        "name": "Docker"
      },
      {
        "name": "Nginx"
      },
      {
        "name": "PM2"
      },
      {
        "name": "GCP"
      },
      {
        "name": "Linux"
      },
      {
        "name": "CI/CD"
      }
    ]
  },
  {
    "id": "ai",
    "label": "AI",
    "summary": "Applied LLM systems in products — orchestration, tools, and local inference where it actually helps.",
    "items": [
      {
        "name": "LLM integrations"
      },
      {
        "name": "AI-powered applications"
      },
      {
        "name": "Local LLMs"
      },
      {
        "name": "AI agents"
      },
      {
        "name": "RAG concepts"
      },
      {
        "name": "AI automation"
      }
    ]
  }
];
