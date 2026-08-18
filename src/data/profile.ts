// Placeholder/example data. The real profile is served from MongoDB in
// production (see src/lib/content.ts). This file ships with the open-source repo
// as a fallback and as a template for anyone forking it — keep it free of real
// personal data.
export const profile = {
  name: "Your Name",
  firstName: "Your",
  lastName: "Name",
  title: "Senior Software Engineer",
  headline: "Building scalable products across mobile, web, backend, and AI.",
  summary:
    "Short professional summary. Describe what you build and the judgment you bring. The live site loads this from the database; this is placeholder copy for the public repo.",
  location: "City, Country",
  availability: "Open to opportunities",
  yearsExperience: 8,
  email: "you@example.com",
  resumeUrl: "/resume",
  website: "https://example.com",
  focus: [
    "Full-stack product engineering",
    "Mobile architecture",
    "Backend systems & APIs",
    "AI-enabled applications",
  ],
} as const;
