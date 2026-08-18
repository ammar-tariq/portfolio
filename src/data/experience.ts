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

// Placeholder/example data — the real work history is served from MongoDB. Keep
// this file free of real employers and dates.
export const experience: Experience[] = [
  {
    id: "example-current",
    role: "Senior Software Engineer",
    company: "Example Company",
    period: "2023 — Present",
    year: "2023",
    location: "Remote",
    summary:
      "One or two sentences on scope and impact. This placeholder ships with the public repo; the live site loads real experience from the database.",
    technologies: ["React", "React Native", "TypeScript", "Node.js", "NestJS", "PostgreSQL"],
    responsibilities: [
      "Describe a shipped outcome and the responsibility behind it.",
      "Describe an architecture or performance decision and its result.",
      "Describe a cross-functional or leadership contribution.",
    ],
    projects: [],
  },
  {
    id: "example-previous",
    role: "Software Engineer",
    company: "Example Company",
    period: "2019 — 2023",
    year: "2019",
    location: "Remote",
    summary: "Earlier role summary goes here.",
    technologies: ["React Native", "TypeScript", "Node.js", "REST APIs"],
    responsibilities: [
      "Built and maintained production mobile and web surfaces.",
      "Supported backend services and API integrations.",
    ],
    projects: [],
  },
];
