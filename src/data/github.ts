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

// Placeholder/example data — the real open-source list is served from MongoDB.
export const openSourceProjects: OpenSourceProject[] = [
  {
    slug: "example-cli",
    title: "Example CLI",
    description: "A short description of an open-source project — what it does and why it exists.",
    repoUrl: "https://github.com/your-handle/example-cli",
    demoUrl: "https://example.com",
    demoLabel: "Docs / demo",
    language: "TypeScript",
    topics: ["CLI", "Node.js"],
  },
  {
    slug: "example-lib",
    title: "Example Library",
    description: "Another open-source project description goes here.",
    repoUrl: "https://github.com/your-handle/example-lib",
    language: "TypeScript",
    topics: ["library", "open source"],
  },
];

export const githubConfig = {
  username: "your-handle",
} as const;
