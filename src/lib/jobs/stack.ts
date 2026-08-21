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

/** Build match terms from free-form labels (required skill chips). */
export function stackTermsFromLabels(labels: string[]): StackTerm[] {
  const terms: StackTerm[] = [];
  const seen = new Set<string>();
  for (const label of labels) {
    const key = tokenKey(label);
    if (!key) continue;
    const aliases = ALIASES[key] ?? [key];
    for (const alias of aliases) {
      const id = tokenKey(alias);
      if (id.length < 2 || seen.has(id)) continue;
      seen.add(id);
      terms.push({
        label: label.trim(),
        pattern: new RegExp(`(?:^|[^a-z0-9.+#])${escapeRe(alias)}(?:$|[^a-z0-9.+#])`, "i"),
      });
    }
  }
  return terms;
}

/**
 * OR within each group, AND across groups.
 * Returns matched labels (one preferred label per group that hit) when all groups pass.
 */
export function matchRequiredSkillGroups(
  text: string,
  groups: string[][],
): { ok: boolean; matched: string[] } {
  if (!groups.length) return { ok: true, matched: [] };
  const hay = ` ${text} `;
  const matched: string[] = [];
  for (const group of groups) {
    const terms = stackTermsFromLabels(group);
    if (!terms.length) continue;
    const hit = terms.find((term) => term.pattern.test(hay));
    if (!hit) return { ok: false, matched: [] };
    if (!matched.includes(hit.label)) matched.push(hit.label);
  }
  return { ok: true, matched };
}

export function isPostedWithinDays(postedAt: Date | string | undefined, days: number): boolean {
  if (!days) return true;
  if (!postedAt) return true; // unknown date — keep, list can show "date unknown"
  const when = postedAt instanceof Date ? postedAt : new Date(postedAt);
  if (Number.isNaN(when.getTime())) return true;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return when.getTime() >= cutoff;
}
