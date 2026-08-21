function unique(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

export const seoTitle = "Ammar Tariq | Senior Full-Stack & React Native Engineer";

export const seoDescription =
  "Ammar Tariq is a senior software engineer with 8+ years shipping production React Native apps, TypeScript frontends, NestJS and Node.js backends, IoT (MQTT), realtime chat, payments, marketplaces, and AI-enabled products. Based in Karachi, Pakistan. Available remotely worldwide, Gulf, UAE, and the United States.";

// Fallback SEO fields used when MongoDB is unavailable. Keep the lists short:
// Google ignores the keywords meta tag, Bing treats oversized keyword lists as
// a spam signal, and LLM crawlers read raw HTML.
export const seoKeywords = unique([
  "Ammar Tariq",
  "Ammar Tariq software engineer",
  "Ammar Tariq React Native developer",
  "Ammar Tariq Karachi",
  "Senior Software Engineer",
  "Senior Full-Stack Engineer",
  "Senior React Native Developer",
  "React Native",
  "Expo",
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "NestJS",
  "Express",
  "GraphQL",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "Socket.io",
  "MQTT",
  "WebRTC",
  "Stripe",
  "IoT mobile apps",
  "realtime chat apps",
  "two-sided marketplaces",
  "in-app subscriptions",
  "LLM integrations",
  "AI-enabled applications",
  "remote software engineer",
]);

// Feeds Person.knowsAbout in JSON-LD — core, defensible expertise only.
export const seoTopics = unique([
  "React Native",
  "Expo",
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "NestJS",
  "Express",
  "REST APIs",
  "GraphQL",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "Socket.io",
  "MQTT",
  "WebRTC",
  "Stripe",
  "Firebase",
  "Redux Toolkit",
  "RTK Query",
  "Docker",
  "Nginx",
  "CI/CD",
  "GCP",
  "Linux",
  "iOS and Android app delivery",
  "in-app purchases",
  "software architecture",
  "mobile architecture",
  "API design",
  "realtime systems",
  "payments",
  "authentication",
  "IoT systems",
  "end-to-end encryption",
  "LLM integrations",
  "AI agents",
  "retrieval-augmented generation",
  "product engineering",
]);
