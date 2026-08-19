import { generateGeminiJson } from "@/lib/draft-project";

const specs: Record<string, { kind: "text" | "list"; instruction: string; max: number; items?: number }> = {
  "experience.summary": {
    kind: "text",
    max: 600,
    instruction: "2–4 sentences. What you owned and shipped. First person, no fluff.",
  },
  "experience.technologies": {
    kind: "list",
    max: 40,
    items: 16,
    instruction: "Canonical technology names from the role. Expand abbreviations. No duplicates.",
  },
  "experience.responsibilities": {
    kind: "list",
    max: 180,
    items: 8,
    instruction: "3–6 concrete bullets of work, not duties-speak.",
  },
  "skill.summary": {
    kind: "text",
    max: 320,
    instruction: "One or two sentences on how this group shows up in real work.",
  },
  "skill.items": {
    kind: "list",
    max: 40,
    items: 16,
    instruction: "Technology or practice names. Canonical, short.",
  },
  "principle.statement": {
    kind: "text",
    max: 180,
    instruction: "One sharp sentence. An engineering belief, not a slogan.",
  },
  "principle.body": {
    kind: "text",
    max: 800,
    instruction: "A short paragraph that makes the principle usable. Concrete.",
  },
  "about.headline": {
    kind: "text",
    max: 220,
    instruction: "One line under the name. Who you are as an engineer.",
  },
  "about.summary": {
    kind: "text",
    max: 800,
    instruction: "Short professional summary. First person is fine. No invented metrics.",
  },
  "about.aboutHeadline": {
    kind: "text",
    max: 160,
    instruction: "Section heading for the about block.",
  },
  "about.aboutBody": {
    kind: "text",
    max: 1200,
    instruction: "1–3 short paragraphs. How you work. No marketing.",
  },
  "about.focus": {
    kind: "list",
    max: 40,
    items: 8,
    instruction: "3–6 focus areas, short labels.",
  },
  "seo.title": {
    kind: "text",
    max: 70,
    instruction: "Search title. Name plus what you do. No keyword stuffing.",
  },
  "seo.description": {
    kind: "text",
    max: 160,
    instruction: "Meta description, one sentence, under 160 characters.",
  },
  "seo.keywords": {
    kind: "list",
    max: 40,
    items: 24,
    instruction: "Search keywords people might type. Real terms, not stuffing.",
  },
  "seo.topics": {
    kind: "list",
    max: 40,
    items: 12,
    instruction: "Broader topics this site is about.",
  },
};

export async function rewriteSiteCopyWithGemini(input: {
  key: string;
  current: unknown;
  context: Record<string, unknown>;
}): Promise<string | string[]> {
  const spec = specs[input.key];
  if (!spec) throw new Error("Unknown field.");
  const prompt = `You rewrite one field on a software engineer's personal site.

Voice: first-person engineer, concrete, no marketing fluff, no invented metrics.

Field: ${input.key}
Instruction: ${spec.instruction}
${spec.kind === "list" ? `Return JSON: { "value": ["item", "..."] } with at most ${spec.items} items, each under ${spec.max} characters.` : `Return JSON: { "value": "..." } under ${spec.max} characters.`}

If the current value is empty, generate it from context. If it has text, improve it and keep the facts.

Current value:
${JSON.stringify(input.current ?? (spec.kind === "list" ? [] : ""))}

Context:
${JSON.stringify(input.context, null, 2)}`;

  const raw = await generateGeminiJson(prompt);
  if (spec.kind === "list") {
    const list = Array.isArray(raw.value) ? raw.value : [];
    const cleaned = list
      .map((item) => String(item ?? "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, spec.items ?? 8)
      .map((item) => item.slice(0, spec.max));
    if (!cleaned.length) throw new Error("Gemini returned an empty list.");
    return cleaned;
  }
  const value = String(raw.value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, spec.max);
  if (!value) throw new Error("Gemini returned empty text.");
  return value;
}
