// Fallback principles used when MongoDB is unavailable.
export const principles = [
  {
    "id": "users",
    "title": "Build for users",
    "statement": "Technology exists to solve real problems.",
    "body": "Architecture is only as good as the product it serves. I start from the job to be done, then choose the simplest system that can grow without becoming a maze."
  },
  {
    "id": "clarity",
    "title": "Keep systems understandable",
    "statement": "Complexity should be intentional.",
    "body": "Every abstraction has a cost. I prefer explicit data flow, typed contracts, and boundaries that a new engineer can learn in a sitting — not a quarter."
  },
  {
    "id": "performance",
    "title": "Performance matters",
    "statement": "Fast software creates better experiences.",
    "body": "Latency, memory, and perceived speed are product features. I treat them as constraints from the first design, not as polish after the screens exist."
  },
  {
    "id": "security",
    "title": "Security is part of engineering",
    "statement": "Especially for financial and enterprise systems.",
    "body": "Trust is earned in the details: auth, data ownership, least privilege, and honest failure modes. Privacy is architecture — not a settings screen."
  },
  {
    "id": "automation",
    "title": "Automate repetitive work",
    "statement": "Good engineering removes unnecessary manual effort.",
    "body": "CI, code generation, and AI assistance should eliminate grind, not hide judgment. The agent can prepare; the engineer still owns the send button."
  },
  {
    "id": "iterate",
    "title": "Ship, measure, improve",
    "statement": "Software gets better through iteration.",
    "body": "I would rather ship a sharp slice with instrumentation than a speculative platform. Feedback, telemetry, and revision beats ceremony."
  }
] as const;
