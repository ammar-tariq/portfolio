const QUOTA_RE = /quota exceeded|exceeded your current quota|RESOURCE_EXHAUSTED/i;
const RETRY_RE = /Please retry in\s+([\d.]+)\s*s/i;
const LIMIT_RE = /limit:\s*(\d+)/i;
const MODEL_RE = /model:\s*(\S+)/i;
const FREE_TIER_RE = /free[_ ]?tier/i;

/** Format a Gemini API error message into a short, human-readable line. */
export function formatGeminiError(raw: string): string {
  const text = raw.trim();
  if (!text) return "Gemini request failed.";

  const retryMatch = text.match(RETRY_RE);
  const isQuota = QUOTA_RE.test(text);

  if (!isQuota && !retryMatch) return text;

  const limitMatch = text.match(LIMIT_RE);
  const modelMatch = text.match(MODEL_RE);
  const freeTier = FREE_TIER_RE.test(text);

  const parts: string[] = [];
  if (isQuota) {
    parts.push(freeTier ? "Gemini free-tier quota exceeded" : "Gemini quota exceeded");
  }
  const detail: string[] = [];
  if (limitMatch) detail.push(`limit ${limitMatch[1]} requests/min`);
  if (modelMatch) detail.push(`model ${modelMatch[1]}`);
  if (detail.length) parts.push(`(${detail.join(", ")})`);

  if (retryMatch) {
    const seconds = Number(retryMatch[1]);
    if (Number.isFinite(seconds) && seconds > 0) {
      parts.push(`Try again in ${formatDuration(seconds)}.`);
    } else if (isQuota) {
      parts.push("Try again shortly.");
    }
  } else if (isQuota) {
    parts.push("Try again shortly.");
  }

  return parts.join(" ").trim();
}

function formatDuration(secondsFloat: number): string {
  const total = Math.max(1, Math.round(secondsFloat));
  if (total < 60) return `${total} second${total === 1 ? "" : "s"}`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m < 60) {
    return s ? `${m} minute${m === 1 ? "" : "s"} ${s} second${s === 1 ? "" : "s"}` : `${m} minute${m === 1 ? "" : "s"}`;
  }
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${h} hour${h === 1 ? "" : "s"} ${mm} minute${mm === 1 ? "" : "s"}` : `${h} hour${h === 1 ? "" : "s"}`;
}

/** True when a Gemini error message indicates a rate-limit / quota exhaustion. */
export function isQuotaError(message: string): boolean {
  return QUOTA_RE.test(message) || RETRY_RE.test(message);
}

/** Extract the "retry in N seconds" value from a Gemini error message, if present. */
export function parseRetrySeconds(message: string): number | null {
  const match = message.match(RETRY_RE);
  if (!match) return null;
  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? Math.max(1, Math.round(seconds)) : null;
}

