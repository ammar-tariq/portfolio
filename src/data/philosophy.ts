// Placeholder/example data — the real principles are served from MongoDB.
export const principles = [
  {
    id: "users",
    title: "Build for users",
    statement: "Technology exists to solve real problems.",
    body: "Start from the job to be done, then choose the simplest system that can grow without becoming a maze.",
  },
  {
    id: "clarity",
    title: "Keep systems understandable",
    statement: "Complexity should be intentional.",
    body: "Prefer explicit data flow, typed contracts, and boundaries a new engineer can learn in a sitting.",
  },
  {
    id: "performance",
    title: "Performance matters",
    statement: "Fast software creates better experiences.",
    body: "Treat latency and perceived speed as product features and design constraints, not after-the-fact polish.",
  },
  {
    id: "iterate",
    title: "Ship, measure, improve",
    statement: "Software gets better through iteration.",
    body: "Ship a sharp slice with instrumentation, then let feedback and revision drive the next step.",
  },
] as const;
