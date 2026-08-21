export type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  year: string;
  location?: string;
  summary: string;
  technologies: string[];
  responsibilities: string[];
  projects: string[];
};

// Fallback work history used when MongoDB is unavailable.
export const experience: Experience[] = 
[
  {
    "id": "pixel-genesys",
    "role": "Senior Full-Stack Engineer",
    "company": "Pixel Genesys",
    "period": "2023 — Present",
    "year": "2026",
    "location": "Remote / United States",
    "summary": "Architecting SaaS platforms and production mobile apps across web, React Native, and backend services — including LLM-assisted product workflows.",
    "technologies": [
      "React",
      "React Native",
      "TypeScript",
      "Node.js",
      "NestJS",
      "MongoDB",
      "PostgreSQL",
      "Firebase",
      "GraphQL",
      "Redux Toolkit",
      "Express",
      "Stripe",
      "Socket.io",
      "Redis",
      "MQTT",
      "WebRTC"
    ],
    "responsibilities": [
      "Architected and scaled SaaS platforms with Node.js, NestJS, and mixed SQL/NoSQL data stores.",
      "Designed GraphQL and REST API contracts that reduced frontend over-fetching and latency.",
      "Shipped SoundSeen full-stack — React Native, React Navigation, RTK Query, Node/Express, and Stripe.",
      "Built Gurrl Talk end-to-end — React Native, React admin, Express, Socket.io, Redis, Stripe, and E2EE chat.",
      "Shipped The Landing List full-stack — home services, classifieds, and lost-and-found on mobile plus APIs.",
      "Built Flagship Towing on MERN and React Native — member app, React admin, and web signup for new customers.",
      "Shipped Lance Craft full-stack — a two-sided event marketplace for finding work and hiring help.",
      "Built Zeus Lights fullstack — React Native, Next.js dashboard, NestJS, and MQTT for permanent LED control.",
      "Shipped DownTime Dating full-stack — schedule-based matching, React Native, admin, chat, and WebRTC calling.",
      "Shipped Manifest Yr Dreamz full-stack — journal, goals, vision board, subscriptions, and admin.",
      "Integrated LLM workflows into product surfaces, including Bar Genius.",
      "Led React Native delivery with Redux Toolkit and RTK Query.",
      "Shipped payment, analytics, and CI/CD paths (including GCP/AWS-style cloud deploys)."
    ],
    "projects": [
      "soundseen",
      "gurrl-talk",
      "bargenius",
      "the-landing-list",
      "flagship-towing",
      "lancecraft",
      "zeus-lights",
      "downtime-dating",
      "manifestyrdreamz"
    ]
  },
  {
    "id": "meta-frolic",
    "role": "Head of Department / Senior Engineer",
    "company": "Meta Frolic Labs",
    "period": "2023",
    "year": "2023",
    "location": "Karachi, Pakistan",
    "summary": "Led engineering direction across product teams — architecture, TypeScript standards, review culture, and the introduction of AI-assisted product features.",
    "technologies": [
      "React Native",
      "TypeScript",
      "NestJS",
      "PostgreSQL",
      "WebRTC",
      "CI/CD"
    ],
    "responsibilities": [
      "Led technical reviews and mentored engineers on mobile architecture and frontend performance.",
      "Standardized TypeScript patterns and introduced CI/CD and automated testing.",
      "Guided cloud-native architecture and real-time communication (WebRTC) practices."
    ],
    "projects": []
  },
  {
    "id": "senior-mobile",
    "role": "Senior Mobile Developer",
    "company": "Salsoft Technologies",
    "period": "2019 — 2023",
    "year": "2019",
    "location": "Karachi, Pakistan",
    "summary": "Delivered production React Native applications across healthtech, e-commerce, and social products — including native modules and real-time calling.",
    "technologies": [
      "React Native",
      "TypeScript",
      "Redux",
      "Java/Kotlin",
      "Swift",
      "WebRTC",
      "Janus Gateway",
      "Firebase",
      "WooCommerce"
    ],
    "responsibilities": [
      "Delivered 10+ production mobile applications with React Native CLI, TypeScript, and Redux.",
      "Built the eoFlix app for Entertainment Oxygen — a marketplace connecting entertainment professionals, festivals, and fans.",
      "Built native Android integrations: sensors, background services, and custom device behavior.",
      "Implemented WebRTC calling with Janus Gateway — signaling, media routing, and NAT traversal.",
      "Migrated legacy Ionic surfaces to React Native to improve startup time and maintainability.",
      "Created reusable module libraries to accelerate product rollout."
    ],
    "projects": [
      "entertainment-oxygen"
    ]
  },
  {
    "id": "software-engineer",
    "role": "Software Engineer",
    "company": "Salsoft Technologies",
    "period": "2018 — 2019",
    "year": "2018",
    "location": "Karachi, Pakistan",
    "summary": "Early-career full-stack work across React Native, React, and Node.js — shipping features, APIs, and production maintenance.",
    "technologies": [
      "React Native",
      "React",
      "Node.js",
      "REST APIs",
      "Ionic",
      "Firebase"
    ],
    "responsibilities": [
      "Built and maintained mobile and web product surfaces.",
      "Supported backend teams with Node.js services and REST APIs.",
      "Worked through feature development, debugging, and production support."
    ],
    "projects": []
  }
];
