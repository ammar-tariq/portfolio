export type OpenSourceProject = {
  slug: string;
  title: string;
  description: string;
  repoUrl: string;
  demoUrl?: string;
  demoLabel?: string;
  language: string;
  topics: string[];
};

// Fallback open-source list used when MongoDB is unavailable.
export const openSourceProjects: OpenSourceProject[] = 
[
  {
    "slug": "jobjitsu",
    "title": "JobJitsu",
    "description": "On-device AI career OS — a local Tauri + React desktop agent for résumés, applications, and follow-ups. Privacy is architecture: nothing leaves the machine unless you send it.",
    "repoUrl": "https://github.com/ammar-tariq/jobjitsu",
    "language": "TypeScript",
    "topics": [
      "Tauri",
      "React",
      "local LLM"
    ],
    "demoUrl": "https://ammar-tariq.github.io/jobjitsu/",
    "demoLabel": "Docs / demo"
  },
  {
    "slug": "influencer-forge",
    "title": "Influencer Forge",
    "description": "Local-first desktop studio for AI virtual influencers — Tauri, React, and a FastAPI orchestrator. Generate and manage content on-device.",
    "repoUrl": "https://github.com/ammar-tariq/influencer-forge",
    "language": "Python",
    "topics": [
      "Tauri",
      "FastAPI",
      "desktop"
    ],
    "demoUrl": "https://github.com/ammar-tariq/influencer-forge/blob/main/demo.gif",
    "demoLabel": "Demo"
  },
  {
    "slug": "open-context-promptless",
    "title": "OpenContext",
    "description": "Figma plugin that exports an AI-ready context package — screens, assets, and navigation — for Cursor, Claude, Copilot, and other coding agents.",
    "repoUrl": "https://github.com/ammar-tariq/open-context-promptless",
    "language": "TypeScript",
    "topics": [
      "Figma",
      "AI",
      "design"
    ]
  },
  {
    "slug": "timesheet-backend",
    "title": "Timesheet API",
    "description": "NestJS time-tracking API with JWT auth, MongoDB, and client-side encryption — the backend only stores encrypted blobs.",
    "repoUrl": "https://github.com/ammar-tariq/timesheet-backend",
    "language": "TypeScript",
    "topics": [
      "NestJS",
      "MongoDB",
      "E2EE"
    ]
  },
  {
    "slug": "realtime-canvas",
    "title": "Realtime chat",
    "description": "Socket.IO chat with rooms, join/leave presence, and a lightweight frontend — a fullstack realtime assessment.",
    "repoUrl": "https://github.com/ammar-tariq/realtime-canvas-fullstack-assessment",
    "language": "TypeScript",
    "topics": [
      "Socket.io",
      "Express",
      "realtime"
    ]
  },
  {
    "slug": "ai-code-review",
    "title": "AI code review",
    "description": "LLM-assisted code review tooling.",
    "repoUrl": "https://github.com/ammar-tariq/ai-code-review",
    "language": "JavaScript",
    "topics": [
      "LLM",
      "tooling"
    ]
  }
];

export const githubConfig = {
  username: "ammar-tariq",
} as const;
