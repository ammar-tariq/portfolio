import type { Industry, Project, ProjectStatus, ProjectVisual } from "@/types/content";
import { slugify } from "@/lib/project-helpers";

const visuals: ProjectVisual[] = [
  "dojo",
  "glass",
  "signal",
  "frame",
  "hub",
  "map",
  "orbit",
  "horizon",
  "catalog",
];

const statuses: ProjectStatus[] = ["shipped", "active", "internal"];

function str(value: unknown, max = 2000) {
  if (value == null) return "";
  return String(value).trim().slice(0, max);
}

function strList(value: unknown, maxItems = 16, maxLen = 160) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => str(item, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function optionalUrl(value: unknown) {
  const url = str(value, 500);
  if (!url) return undefined;
  if (!/^https?:\/\//i.test(url)) return undefined;
  return url;
}

function parseJsonObject(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON");
  return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
}

export function projectFromDraft(raw: Record<string, unknown>, industries: Industry[]): Partial<Project> {
  const allowed = new Set(industries.map((item) => item.id));
  const byLabel = new Map(industries.map((item) => [item.label.toLowerCase(), item.id]));
  const industryIds = (Array.isArray(raw.industries) ? raw.industries : [])
    .map((item) => str(item, 80).toLowerCase())
    .map((item) => (allowed.has(item) ? item : byLabel.get(item)))
    .filter((item): item is string => Boolean(item && allowed.has(item)));

  const title = str(raw.title, 120);
  const status = statuses.includes(raw.status as ProjectStatus) ? (raw.status as ProjectStatus) : "shipped";
  const visual = visuals.includes(raw.visual as ProjectVisual) ? (raw.visual as ProjectVisual) : "orbit";

  return {
    title,
    slug: slugify(str(raw.slug, 80) || title),
    seoLabel: str(raw.seoLabel, 120) || title,
    seoDescription: str(raw.seoDescription, 320),
    tagline: str(raw.tagline, 180),
    description: str(raw.description, 1200),
    industries: [...new Set(industryIds)],
    role: str(raw.role, 160),
    year: str(raw.year, 20) || undefined,
    status,
    technologies: strList(raw.technologies),
    github: optionalUrl(raw.github),
    liveUrl: optionalUrl(raw.liveUrl),
    liveLabel: str(raw.liveLabel, 40) || undefined,
    appStoreUrl: optionalUrl(raw.appStoreUrl),
    webUrl: optionalUrl(raw.webUrl),
    webLabel: str(raw.webLabel, 40) || undefined,
    challenge: str(raw.challenge, 1200) || undefined,
    solution: str(raw.solution, 1200) || undefined,
    architecture: strList(raw.architecture, 10, 220),
    engineering: strList(raw.engineering, 10, 220),
    outcome: str(raw.outcome, 800) || undefined,
    highlights: strList(raw.highlights, 10, 180),
    applicationCategory: str(raw.applicationCategory, 80) || undefined,
    visual,
  };
}

export async function draftProjectWithGemini(notes: string, industries: Industry[]): Promise<Partial<Project>> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("Add GEMINI_API_KEY to .env (Google AI Studio).");

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const industryList = industries.map((item) => `${item.id} (${item.label})`).join(", ");
  const prompt = `You draft case-study fields for a developer portfolio. Voice: first-person engineer, concrete, no marketing fluff, no invented metrics.

Allowed industries (use ids only): ${industryList || "none"}
Allowed visual: ${visuals.join(", ")}
Allowed status: ${statuses.join(", ")}

Return JSON only with keys:
title, slug, seoLabel, seoDescription, tagline, description, industries, role, year, status,
technologies, github, liveUrl, liveLabel, appStoreUrl, webUrl, webLabel, challenge, solution,
architecture, engineering, outcome, highlights, applicationCategory, visual.

Rules:
- seoLabel is brand-free (what the product is, not the client name if possible).
- seoDescription is one sentence, under 160 characters.
- description is 1–3 sentences.
- challenge, solution, outcome are short paragraphs.
- architecture, engineering, highlights, technologies are string arrays.
- industries is an array of allowed ids only.
- Leave URLs empty unless they appear in the notes.
- slug is kebab-case.
- applicationCategory like BusinessApplication or MobileApplication when obvious.

Notes:
${notes}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  const body = (await response.json()) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  if (!response.ok) {
    throw new Error(body.error?.message || `Gemini request failed (${response.status})`);
  }

  const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text) throw new Error("Gemini returned an empty draft.");
  return projectFromDraft(parseJsonObject(text), industries);
}
