import { createHash } from "node:crypto";
import { normalizeToken } from "@/lib/jobs/watch-input";

export { normalizeToken } from "@/lib/jobs/watch-input";

export function stripHtml(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function clipText(value: string, max = 20000) {
  return value.trim().slice(0, max);
}

export function normalizeApplyUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return raw.trim();
  }
  url.hash = "";
  const drop = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gh_src", "gh_jid", "ref"];
  for (const key of drop) url.searchParams.delete(key);
  url.hostname = url.hostname.toLowerCase();
  let href = url.toString();
  if (href.endsWith("/") && url.pathname !== "/") href = href.slice(0, -1);
  return href;
}

export function titleCompanyLocationHash(title: string, company: string, location: string) {
  const key = [title, company, location]
    .map((part) => part.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim())
    .join("|");
  return createHash("sha256").update(key).digest("hex").slice(0, 32);
}

export function canonicalKey(input: {
  applyUrl?: string;
  source: string;
  atsJobId?: string;
  boardToken?: string;
  announcementNumber?: string;
  hash: string;
}) {
  if (input.applyUrl) return `url:${normalizeApplyUrl(input.applyUrl)}`;
  if (input.atsJobId && input.boardToken) {
    return `ats:${input.source}:${normalizeToken(input.boardToken)}:${input.atsJobId}`;
  }
  if (input.announcementNumber) return `gov:usajobs:${input.announcementNumber}`;
  return `hash:${input.hash}`;
}
