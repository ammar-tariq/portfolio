import { siteHost } from "@/lib/env";

const MAX_BYTES = 1_200_000;
const TIMEOUT_MS = 12_000;

export function jobUserAgent() {
  const host = siteHost();
  const email = process.env.NOTIFY_EMAIL?.trim() || process.env.USAJOBS_USER_AGENT?.trim() || `jobs@${host}`;
  return `AmmarPortfolioJobTracker/1.0 (+https://${host}; ${email})`;
}

export async function fetchJobFeed(
  url: string,
  init?: RequestInit & { timeoutMs?: number; retries?: number },
): Promise<{ ok: true; status: number; text: string } | { ok: false; status: number; error: string }> {
  const { timeoutMs = TIMEOUT_MS, retries = 1, ...fetchInit } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = new Headers(fetchInit.headers);
    if (!headers.has("User-Agent")) headers.set("User-Agent", jobUserAgent());
    if (!headers.has("Accept")) headers.set("Accept", "application/json, application/xml, text/xml, application/rss+xml, text/plain, */*");
    const response = await fetch(url, {
      ...fetchInit,
      headers,
      redirect: "follow",
      signal: controller.signal,
    });
    if (response.status === 429 && retries > 0) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter) ? Math.min(15_000, Math.max(1_000, retryAfter * 1000)) : 2_000;
      await response.arrayBuffer();
      clearTimeout(timer);
      await sleep(waitMs);
      return fetchJobFeed(url, { ...init, retries: retries - 1 });
    }
    if (response.status === 429) {
      return { ok: false, status: 429, error: "Rate limited (429)." };
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) {
      return { ok: false, status: response.status, error: "Feed is too large." };
    }
    const text = buffer.toString("utf8");
    if (!response.ok) {
      return { ok: false, status: response.status, error: `HTTP ${response.status}` };
    }
    return { ok: true, status: response.status, text };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, status: 0, error: "Timed out." };
    }
    return { ok: false, status: 0, error: error instanceof Error ? error.message : "Fetch failed." };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJobJson<T>(url: string, init?: RequestInit): Promise<T> {
  const result = await fetchJobFeed(url, init);
  if (!result.ok) throw new Error(result.error);
  try {
    return JSON.parse(result.text) as T;
  } catch {
    throw new Error("Feed was not valid JSON.");
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
