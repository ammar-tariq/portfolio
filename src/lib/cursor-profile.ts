import { siteHost } from "@/lib/env";

export type CursorDay = { date: string; count: number };

export type CursorProfile = {
  handle: string;
  displayName: string;
  avatarUrl?: string;
  joinedDate: string;
  profileUrl: string;
  longestStreak: number;
  currentStreak: number;
  agents: number;
  longestAgentSeconds: number;
  tokens: number;
  mostActiveDay?: string;
  days: CursorDay[];
};

function extractProfileJson(payload: string) {
  const marker = '"profile":{"handle"';
  const start = payload.indexOf(marker);
  if (start < 0) return null;
  const brace = payload.indexOf("{", start);
  let depth = 0;
  for (let i = brace; i < payload.length; i++) {
    const char = payload[i];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(payload.slice(brace, i + 1)) as Record<string, unknown>;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function num(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function str(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function cursorProfileUrl(handle: string) {
  return `https://cursor.com/@${handle}`;
}

export async function getCursorProfile(handle: string): Promise<CursorProfile | null> {
  const clean = handle.trim().replace(/^@/, "").toLowerCase();
  if (!/^[a-z0-9-]{3,40}$/.test(clean)) return null;
  try {
    const response = await fetch(cursorProfileUrl(clean), {
      headers: {
        Accept: "text/x-component, text/html",
        RSC: "1",
        "User-Agent": `${siteHost()} portfolio`,
      },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const payload = await response.text();
    const data = extractProfileJson(payload);
    if (!data || str(data.visibility) !== "PUBLIC") return null;
    const stats = (data.stats ?? {}) as Record<string, unknown>;
    const activity = Array.isArray(data.activityCounts) ? data.activityCounts : [];
    const tokensOverTime = Array.isArray(data.tokensOverTime) ? data.tokensOverTime : [];
    const tokens = tokensOverTime.reduce((sum, item) => {
      const row = item as Record<string, unknown>;
      return sum + num(row.tokens);
    }, 0);
    return {
      handle: str(data.handle) || clean,
      displayName: str(data.displayName) || clean,
      avatarUrl: str(data.avatarUrl) || undefined,
      joinedDate: str(data.joinedDate),
      profileUrl: cursorProfileUrl(clean),
      longestStreak: num(stats.longestStreak),
      currentStreak: num(stats.currentStreak),
      agents: num(stats.agentsLocal) + num(stats.agentsCloud),
      longestAgentSeconds: num(stats.longestAgentSeconds),
      tokens,
      mostActiveDay: str(stats.mostActiveDay) || undefined,
      days: activity
        .map((item) => {
          const row = item as Record<string, unknown>;
          return { date: str(row.date), count: num(row.count) };
        })
        .filter((day) => day.date),
    };
  } catch (error) {
    console.error("cursor profile fetch failed", error);
    return null;
  }
}
