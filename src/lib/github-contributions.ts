import { siteHost } from "@/lib/env";

export type GithubContributions = {
  total: number;
  currentStreak: number;
  longestStreak: number;
  days: { date: string; count: number }[];
};

const VIEWER_QUERY = `
  query {
    viewer {
      login
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

function streaks(days: { date: string; count: number }[]) {
  const ordered = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let current = 0;
  let run = 0;
  for (const day of ordered) {
    if (day.count > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  for (let i = ordered.length - 1; i >= 0; i--) {
    if (ordered[i].count > 0) current += 1;
    else if (i === ordered.length - 1) continue;
    else break;
  }
  return { currentStreak: current, longestStreak: longest };
}

function fromCalendar(
  calendar:
    | {
        totalContributions?: number;
        weeks?: { contributionDays?: { date: string; contributionCount: number }[] }[];
      }
    | undefined,
) {
  if (!calendar) return null;
  const days =
    calendar.weeks?.flatMap((week) =>
      (week.contributionDays ?? []).map((day) => ({ date: day.date, count: day.contributionCount })),
    ) ?? [];
  if (days.length < 50) return null;
  return { total: calendar.totalContributions ?? days.reduce((sum, day) => sum + day.count, 0), days, ...streaks(days) };
}

async function fromGraphql(login: string): Promise<GithubContributions | null> {
  const token = process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim();
  if (!token) return null;
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": siteHost(),
    },
    body: JSON.stringify({ query: VIEWER_QUERY }),
    next: { revalidate: 3600 },
  });
  if (!response.ok) return null;
  const json = (await response.json()) as {
    data?: {
      viewer?: {
        login?: string;
        contributionsCollection?: {
          contributionCalendar?: {
            totalContributions?: number;
            weeks?: { contributionDays?: { date: string; contributionCount: number }[] }[];
          };
        };
      };
    };
  };
  const viewer = json.data?.viewer;
  if (!viewer?.login || viewer.login.toLowerCase() !== login.toLowerCase()) return null;
  return fromCalendar(viewer.contributionsCollection?.contributionCalendar);
}

function parseHtml(html: string): GithubContributions | null {
  const days: { date: string; count: number }[] = [];
  const tags = html.matchAll(/<td\b[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g);
  const tips = [...html.matchAll(/>(No|\d+) contributions? on /g)].map((match) =>
    match[1] === "No" ? 0 : Number(match[1]),
  );
  let index = 0;
  for (const tag of tags) {
    days.push({ date: tag[1], count: tips[index] ?? 0 });
    index += 1;
  }
  if (days.length < 50) return null;
  const heading = html.match(/([\d,]+)\s+contributions\s+in the last year/i);
  const total = heading ? Number(heading[1].replaceAll(",", "")) : days.reduce((sum, day) => sum + day.count, 0);
  return { total, days, ...streaks(days) };
}

async function fromHtml(login: string): Promise<GithubContributions | null> {
  const response = await fetch(`https://github.com/users/${login}/contributions`, {
    headers: { "User-Agent": `${siteHost()} portfolio`, Accept: "text/html" },
    next: { revalidate: 3600 },
  });
  if (!response.ok) return null;
  return parseHtml(await response.text());
}

export async function getGithubContributions(login: string): Promise<GithubContributions | null> {
  const clean = login.trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9-]{1,39}$/.test(clean)) return null;
  try {
    return (await fromHtml(clean)) ?? (await fromGraphql(clean));
  } catch (error) {
    console.error("github contributions fetch failed", error);
    return null;
  }
}
