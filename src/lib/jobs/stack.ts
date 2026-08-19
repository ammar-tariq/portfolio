import type { SiteContent } from "@/types/content";

const ALIASES: Record<string, string[]> = {
  react: ["react", "react.js", "reactjs"],
  "next.js": ["next.js", "nextjs", "next js"],
  typescript: ["typescript"],
  "redux toolkit": ["redux toolkit", "redux-toolkit", "rtk", "redux"],
  "react native": ["react native", "react-native", "reactnative"],
  expo: ["expo"],
  "react navigation": ["react navigation"],
  firebase: ["firebase"],
  "node.js": ["node.js", "nodejs", "node js"],
  express: ["express", "express.js", "expressjs"],
  nestjs: ["nestjs", "nest.js", "nest js"],
  graphql: ["graphql"],
  "socket.io": ["socket.io", "socketio"],
  postgresql: ["postgresql", "postgres", "psql"],
  mongodb: ["mongodb", "mongo"],
  redis: ["redis"],
  docker: ["docker"],
  nginx: ["nginx"],
  "ci/cd": ["ci/cd", "ci cd", "github actions", "gitlab ci"],
  linux: ["linux"],
  "llm integrations": ["llm", "large language model", "openai", "anthropic", "gemini", "langchain"],
  "ai agents": ["ai agent", "agentic", "ai agents"],
  "rag concepts": ["rag", "retrieval augmented"],
};

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenKey(value: string) {
  return value.trim().toLowerCase();
}

export type StackTerm = {
  label: string;
  pattern: RegExp;
};

export function stackTermsFromContent(content: SiteContent): StackTerm[] {
  const labels = new Set<string>();
  for (const category of content.skillCategories) {
    for (const item of category.items) {
      if (item.name.trim()) labels.add(item.name.trim());
    }
  }
  for (const role of content.experience) {
    for (const tech of role.technologies) {
      if (tech.trim()) labels.add(tech.trim());
    }
  }
  for (const project of content.projects) {
    for (const tech of project.technologies) {
      if (tech.trim()) labels.add(tech.trim());
    }
  }

  const terms: StackTerm[] = [];
  const seen = new Set<string>();
  for (const label of labels) {
    const key = tokenKey(label);
    const aliases = ALIASES[key] ?? [key];
    for (const alias of aliases) {
      const id = tokenKey(alias);
      if (id.length < 3 || seen.has(id)) continue;
      seen.add(id);
      terms.push({
        label,
        pattern: new RegExp(`(?:^|[^a-z0-9.+#])${escapeRe(alias)}(?:$|[^a-z0-9.+#])`, "i"),
      });
    }
  }
  return terms;
}

export function matchStack(text: string, terms: StackTerm[]): string[] {
  const hay = ` ${text} `;
  const hits = new Set<string>();
  for (const term of terms) {
    if (term.pattern.test(hay)) hits.add(term.label);
  }
  return [...hits].slice(0, 12);
}
