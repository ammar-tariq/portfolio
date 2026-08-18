import { lookup } from "node:dns/promises";
import { isPrivateIp } from "@/lib/client-ip";

export type SharedJob = {
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  jd: string;
  aboutCompany: string;
};

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"]);

function extractUrls(value: string) {
  return [...value.matchAll(/https?:\/\/[^\s<>"']+/gi)].map((match) => match[0].replace(/[),.;]+$/g, ""));
}

function decode(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function meta(html: string, key: string) {
  const property = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const contentFirst = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
    "i",
  );
  return decode(property.exec(html)?.[1] ?? contentFirst.exec(html)?.[1] ?? "").trim();
}

function stripTags(html: string) {
  return decode(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " "),
  ).trim();
}

function parseTitle(title: string) {
  const cleaned = title.replace(/\s*[|·•].*$/, "").trim();
  const match = /^(.*?)\s+(?:at|@|–|—|-)\s+(.*)$/i.exec(cleaned);
  if (match) return { role: match[1].trim(), company: match[2].trim() };
  return { role: cleaned, company: "" };
}

function jsonLdJobs(html: string) {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const jobs: Record<string, unknown>[] = [];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1] ?? "") as unknown;
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of list) {
        if (!item || typeof item !== "object") continue;
        const row = item as Record<string, unknown>;
        const graph = Array.isArray(row["@graph"]) ? row["@graph"] : [row];
        for (const node of graph) {
          if (!node || typeof node !== "object") continue;
          const type = String((node as { "@type"?: unknown })["@type"] ?? "");
          if (type.toLowerCase().includes("jobposting")) jobs.push(node as Record<string, unknown>);
        }
      }
    } catch {
      /* ignore malformed JSON-LD */
    }
  }
  return jobs[0];
}

export function parseSharedJob(input: { title?: string; text?: string; url?: string }): SharedJob {
  const title = input.title?.trim() ?? "";
  const text = input.text?.trim() ?? "";
  const urls = [...extractUrls(input.url ?? ""), ...extractUrls(text), ...extractUrls(title)];
  const jobUrl = urls[0] ?? "";
  const named = parseTitle(title && !title.startsWith("http") ? title : "");
  let jd = text;
  if (jobUrl && (jd === jobUrl || extractUrls(jd).join(" ") === jd)) jd = "";
  if (jobUrl) jd = jd.replace(jobUrl, "").trim();
  return {
    company: named.company,
    role: named.role,
    location: "",
    jobUrl,
    jd,
    aboutCompany: "",
  };
}

async function assertPublicHttpUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("That does not look like a job URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only http(s) job URLs can be imported.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal") || host === "localhost") {
    throw new Error("That URL cannot be fetched.");
  }
  const records = await lookup(host, { all: true });
  if (!records.length || records.some((row) => isPrivateIp(row.address))) {
    throw new Error("That URL cannot be fetched.");
  }
  return url;
}

async function fetchChecked(raw: string, hops = 0): Promise<{ url: string; html: string }> {
  if (hops > 3) throw new Error("Too many redirects.");
  const url = await assertPublicHttpUrl(raw);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobImport/1.0)", Accept: "text/html" },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Job page redirected without a location.");
      return fetchChecked(new URL(location, url).toString(), hops + 1);
    }
    if (!response.ok) throw new Error(`Job page returned ${response.status}.`);
    const type = response.headers.get("content-type") ?? "";
    if (type && !type.includes("html") && !type.includes("json") && !type.includes("text")) {
      throw new Error("That URL is not a job page.");
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > 600_000) throw new Error("Job page is too large to import.");
    return { url: url.toString(), html: buffer.toString("utf8") };
  } finally {
    clearTimeout(timer);
  }
}

export function extractJobFromHtml(html: string, jobUrl: string): SharedJob {
  const job = jsonLdJobs(html);
  const org = job?.hiringOrganization;
  const orgName =
    typeof org === "string"
      ? org
      : org && typeof org === "object"
        ? String((org as { name?: unknown }).name ?? "")
        : "";
  const locationRaw = job?.jobLocation;
  const locationObj = Array.isArray(locationRaw) ? locationRaw[0] : locationRaw;
  const address =
    locationObj && typeof locationObj === "object"
      ? ((locationObj as { address?: { addressLocality?: string; addressRegion?: string; addressCountry?: string } }).address ??
        {})
      : {};
  const location = [address.addressLocality, address.addressRegion, address.addressCountry].filter(Boolean).join(", ");
  const jsonTitle = String(job?.title ?? "").trim();
  const jsonJd = stripTags(String(job?.description ?? ""));
  const pageTitle = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const ogTitle = meta(html, "og:title");
  const ogDescription = meta(html, "og:description") || meta(html, "description");
  const named = parseTitle(jsonTitle || ogTitle || pageTitle);
  const orgDescription =
    org && typeof org === "object" ? String((org as { description?: unknown }).description ?? "") : "";
  const jd = (jsonJd || ogDescription || stripTags(html)).slice(0, 20000);
  return {
    company: orgName.trim() || named.company,
    role: jsonTitle || named.role,
    location,
    jobUrl,
    jd,
    aboutCompany: orgDescription.slice(0, 4000),
  };
}

export async function fetchPublicJobPage(rawUrl: string): Promise<SharedJob> {
  const { url, html } = await fetchChecked(rawUrl);
  const extracted = extractJobFromHtml(html, url);
  if (!extracted.jd && !extracted.role) {
    throw new Error("Could not read that posting. Paste the job description instead.");
  }
  return extracted;
}
