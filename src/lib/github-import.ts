import { slugify } from "@/lib/project-helpers";
import { siteHost } from "@/lib/env";
import type { Industry, OpenSourceProject, Project } from "@/types/content";

type RepoSummary = {
  owner: string;
  name: string;
  fullName: string;
  description: string;
  homepage?: string;
  htmlUrl: string;
  language: string;
  topics: string[];
  fork: boolean;
  archived: boolean;
  pushedAt?: string;
  readme?: string;
};

function githubHeaders(accept = "application/vnd.github+json") {
  const token = process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim();
  return {
    Accept: accept,
    "User-Agent": siteHost(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseJsonObject(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON");
  return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
}

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
  if (!url || !/^https?:\/\//i.test(url)) return undefined;
  return url;
}

export function parseGithubRepoUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("GitHub repo URL must look like https://github.com/owner/repo");
  }
  if (url.hostname.replace(/^www\./, "").toLowerCase() !== "github.com") {
    throw new Error("Only github.com repo URLs are supported.");
  }
  const [owner, repo] = url.pathname
    .split("/")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.trim());
  if (!owner || !repo) {
    throw new Error("GitHub repo URL must include both owner and repo.");
  }
  return { owner, repo: repo.replace(/\.git$/i, "") };
}

export function parseGithubOwner(input: string) {
  const value = input.trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9-]{1,39}$/.test(value)) throw new Error("GitHub owner must be a valid username or org.");
  return value;
}

async function fetchGithubJson<T>(path: string) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders(),
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API failed (${response.status}): ${body.slice(0, 140)}`);
  }
  return (await response.json()) as T;
}

async function fetchGithubText(path: string, accept: string) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders(accept),
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 404) return "";
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API failed (${response.status}): ${body.slice(0, 140)}`);
  }
  return await response.text();
}

async function fetchRepo(owner: string, repo: string): Promise<RepoSummary> {
  const data = await fetchGithubJson<{
    name: string;
    full_name: string;
    description?: string;
    homepage?: string;
    html_url: string;
    language?: string;
    topics?: string[];
    fork?: boolean;
    archived?: boolean;
    pushed_at?: string;
    owner?: { login?: string };
  }>(`/repos/${owner}/${repo}`);
  const readme = await fetchGithubText(`/repos/${owner}/${repo}/readme`, "application/vnd.github.raw+json").catch(
    () => "",
  );
  return {
    owner: data.owner?.login || owner,
    name: data.name,
    fullName: data.full_name,
    description: data.description?.trim() || "",
    homepage: data.homepage?.trim() || undefined,
    htmlUrl: data.html_url,
    language: data.language?.trim() || "",
    topics: (data.topics ?? []).map((topic) => topic.trim()).filter(Boolean),
    fork: Boolean(data.fork),
    archived: Boolean(data.archived),
    pushedAt: data.pushed_at || undefined,
    readme: readme.trim() || undefined,
  };
}

async function listRepos(owner: string): Promise<RepoSummary[]> {
  const repos = await fetchGithubJson<
    {
      name: string;
      full_name: string;
      description?: string;
      homepage?: string;
      html_url: string;
      language?: string;
      topics?: string[];
      fork?: boolean;
      archived?: boolean;
      pushed_at?: string;
      owner?: { login?: string };
    }[]
  >(`/users/${owner}/repos?per_page=100&type=owner&sort=updated`);
  return repos.map((repo) => ({
    owner: repo.owner?.login || owner,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description?.trim() || "",
    homepage: repo.homepage?.trim() || undefined,
    htmlUrl: repo.html_url,
    language: repo.language?.trim() || "",
    topics: (repo.topics ?? []).map((topic) => topic.trim()).filter(Boolean),
    fork: Boolean(repo.fork),
    archived: Boolean(repo.archived),
    pushedAt: repo.pushed_at || undefined,
  }));
}

async function draftOpenSourceDescription(repo: RepoSummary) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return repo.description || `${repo.name} is an open source project on GitHub.`;

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const prompt = `Write a concise portfolio-ready description for this open source repo.

Rules:
- Return JSON only with keys: description, demoLabel.
- description: 1 sentence, under 180 characters, factual, no hype.
- demoLabel: only if homepage clearly looks like a live demo or docs URL.

Repo:
- Name: ${repo.name}
- Full name: ${repo.fullName}
- Description: ${repo.description || "(none)"}
- Homepage: ${repo.homepage || "(none)"}
- Language: ${repo.language || "(none)"}
- Topics: ${repo.topics.join(", ") || "(none)"}

README:
${repo.readme?.slice(0, 6000) || "(none)"}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
      }),
    },
  );

  const body = (await response.json()) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  if (!response.ok) throw new Error(body.error?.message || `Gemini request failed (${response.status})`);
  const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text) return repo.description || `${repo.name} is an open source project on GitHub.`;
  const parsed = parseJsonObject(text);
  return str(parsed.description, 180) || repo.description || `${repo.name} is an open source project on GitHub.`;
}

async function draftProjectFromRepo(repo: RepoSummary, industries: Industry[]) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const technologies = [repo.language, ...repo.topics].filter(Boolean).slice(0, 12);
    return {
      title: repo.name,
      slug: slugify(repo.name),
      seoLabel: repo.name,
      seoDescription: repo.description || `${repo.name} on GitHub`,
      tagline: repo.description || "",
      description: repo.description || "",
      github: repo.htmlUrl,
      webUrl: repo.homepage,
      webLabel: repo.homepage ? "Live" : undefined,
      technologies,
      highlights: repo.topics.slice(0, 6),
      architecture: [],
      engineering: [],
      industries: [],
      visual: "orbit" as const,
    } satisfies Partial<Project>;
  }

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const industryList = industries.map((item) => `${item.id} (${item.label})`).join(", ");
  const prompt = `You draft portfolio project fields from a GitHub repository. Voice: first-person engineer, concrete, no invented metrics.

Return JSON only with keys:
title, slug, seoLabel, seoDescription, tagline, description, industries, role, year, status,
technologies, github, webUrl, webLabel, challenge, solution, architecture, engineering, outcome, highlights, visual.

Rules:
- Use only these industry ids: ${industryList || "none"}
- seoDescription is under 160 characters.
- description is 1-3 sentences.
- challenge, solution, outcome are short and factual.
- architecture, engineering, highlights, technologies are arrays.
- visual must be one of: dojo, glass, signal, frame, hub, map, orbit, horizon, catalog.
- github should be ${repo.htmlUrl}
- webUrl should only be set if homepage exists.

Repo:
- Name: ${repo.name}
- Full name: ${repo.fullName}
- Description: ${repo.description || "(none)"}
- Homepage: ${repo.homepage || "(none)"}
- Language: ${repo.language || "(none)"}
- Topics: ${repo.topics.join(", ") || "(none)"}
- Last pushed: ${repo.pushedAt || "(unknown)"}

README:
${repo.readme?.slice(0, 10000) || "(none)"}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.35, responseMimeType: "application/json" },
      }),
    },
  );

  const body = (await response.json()) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  if (!response.ok) throw new Error(body.error?.message || `Gemini request failed (${response.status})`);
  const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text) throw new Error("Gemini returned an empty project draft.");
  const raw = parseJsonObject(text);
  const allowed = new Set(industries.map((item) => item.id));
  const byLabel = new Map(industries.map((item) => [item.label.toLowerCase(), item.id]));
  const industryIds = (Array.isArray(raw.industries) ? raw.industries : [])
    .map((item) => str(item, 80).toLowerCase())
    .map((item) => (allowed.has(item) ? item : byLabel.get(item)))
    .filter((item): item is string => Boolean(item && allowed.has(item)));

  return {
    title: str(raw.title, 120) || repo.name,
    slug: slugify(str(raw.slug, 80) || str(raw.title, 120) || repo.name),
    seoLabel: str(raw.seoLabel, 120) || str(raw.title, 120) || repo.name,
    seoDescription: str(raw.seoDescription, 320) || repo.description || `${repo.name} on GitHub`,
    tagline: str(raw.tagline, 180) || repo.description,
    description: str(raw.description, 1200) || repo.description,
    industries: [...new Set(industryIds)],
    role: str(raw.role, 160),
    year: str(raw.year, 20) || undefined,
    status: ["shipped", "active", "internal"].includes(str(raw.status, 20)) ? (str(raw.status, 20) as Project["status"]) : undefined,
    technologies: strList(raw.technologies, 16, 80),
    github: repo.htmlUrl,
    webUrl: optionalUrl(raw.webUrl) ?? repo.homepage,
    webLabel: str(raw.webLabel, 40) || (repo.homepage ? "Live" : undefined),
    challenge: str(raw.challenge, 1200) || undefined,
    solution: str(raw.solution, 1200) || undefined,
    architecture: strList(raw.architecture, 10, 220),
    engineering: strList(raw.engineering, 10, 220),
    outcome: str(raw.outcome, 800) || undefined,
    highlights: strList(raw.highlights, 10, 180),
    visual: (["dojo", "glass", "signal", "frame", "hub", "map", "orbit", "horizon", "catalog"].includes(str(raw.visual, 40))
      ? str(raw.visual, 40)
      : "orbit") as Project["visual"],
  } satisfies Partial<Project>;
}

function repoToOpenSource(repo: RepoSummary, description: string): OpenSourceProject {
  return {
    slug: slugify(repo.name),
    title: repo.name,
    description,
    repoUrl: repo.htmlUrl,
    demoUrl: repo.homepage,
    demoLabel: repo.homepage ? "Live" : undefined,
    language: repo.language,
    topics: repo.topics,
  };
}

export async function importOpenSourceRepoFromGithub(repoUrl: string) {
  const { owner, repo } = parseGithubRepoUrl(repoUrl);
  const summary = await fetchRepo(owner, repo);
  const description = await draftOpenSourceDescription(summary);
  return repoToOpenSource(summary, description);
}

export async function importOpenSourceOwnerFromGithub(ownerInput: string) {
  const owner = parseGithubOwner(ownerInput);
  const repos = await listRepos(owner);
  const filtered = repos.filter((repo) => !repo.fork && !repo.archived);
  return filtered.map((repo) => repoToOpenSource(repo, repo.description || `${repo.name} is an open source project on GitHub.`));
}

export async function importProjectFromGithubRepo(repoUrl: string, industries: Industry[]) {
  const { owner, repo } = parseGithubRepoUrl(repoUrl);
  const summary = await fetchRepo(owner, repo);
  return await draftProjectFromRepo(summary, industries);
}
