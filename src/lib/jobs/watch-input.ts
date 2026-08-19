export function normalizeToken(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

const BOARD_HOSTS: {
  host: RegExp;
  ats: "greenhouse" | "lever" | "ashby" | "workable" | "recruitee" | "personio" | "breezy" | "smartrecruiters" | "bamboohr";
  token: (url: URL) => string;
}[] = [
  { host: /(^|\.)greenhouse\.io$/i, ats: "greenhouse", token: (url) => url.pathname.split("/").filter(Boolean)[0] ?? "" },
  { host: /(^|\.)lever\.co$/i, ats: "lever", token: (url) => url.pathname.split("/").filter(Boolean).find((part) => part !== "v0" && part !== "postings") ?? "" },
  { host: /(^|\.)ashbyhq\.com$/i, ats: "ashby", token: (url) => url.pathname.split("/").filter(Boolean).at(-1) ?? "" },
  { host: /(^|\.)workable\.com$/i, ats: "workable", token: (url) => url.pathname.split("/").filter(Boolean)[0] ?? "" },
  { host: /(^|\.)recruitee\.com$/i, ats: "recruitee", token: (url) => url.hostname.split(".")[0] ?? "" },
  { host: /(^|\.)personio\.[a-z]+$/i, ats: "personio", token: (url) => url.hostname.split(".")[0] ?? "" },
  { host: /(^|\.)breezy\.hr$/i, ats: "breezy", token: (url) => url.hostname.split(".")[0] ?? "" },
  { host: /(^|\.)smartrecruiters\.com$/i, ats: "smartrecruiters", token: (url) => url.pathname.split("/").filter(Boolean)[0] ?? "" },
  { host: /(^|\.)bamboohr\.com$/i, ats: "bamboohr", token: (url) => url.hostname.split(".")[0] ?? "" },
];

export function parseWatchInput(raw: string): { token: string; ats?: (typeof BOARD_HOSTS)[number]["ats"] } {
  const trimmed = raw.trim();
  if (!trimmed) return { token: "" };
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const match = BOARD_HOSTS.find((row) => row.host.test(url.hostname));
    if (match) {
      const token = normalizeToken(match.token(url)).replace(/^.*\//, "");
      if (token && token !== "www" && token !== "api" && token !== "jobs" && token !== "apply") {
        return { token, ats: match.ats };
      }
    }
  } catch {
    /* not a URL */
  }
  return { token: normalizeToken(trimmed).replace(/^.*\//, "") };
}
