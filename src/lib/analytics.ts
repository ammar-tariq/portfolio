import { connectDb } from "@/lib/db";
import { hasMongo, siteHost } from "@/lib/env";
import { homeSectionFromPathname } from "@/lib/home-sections";
import { PageViewModel, ProjectModel } from "@/models";

export { isPrivateIp } from "@/lib/client-ip";

export type AnalyticsSummary = {
  views: number;
  uniques: number;
  pages: { path: string; label: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  countries: { country: string; count: number }[];
  cities: { city: string; country: string; lat?: number; lng?: number; count: number }[];
  geoUnavailable: boolean;
};

function ownHosts(requestHost?: string) {
  const hosts = new Set(["localhost", "127.0.0.1"]);
  for (const raw of [process.env.AUTH_URL, `https://${siteHost()}`]) {
    if (!raw) continue;
    try {
      hosts.add(new URL(raw).hostname.replace(/^www\./, "").toLowerCase());
    } catch {
      /* ignore invalid AUTH_URL */
    }
  }
  if (requestHost) {
    hosts.add(requestHost.replace(/^www\./, "").split(":")[0].toLowerCase());
  }
  return hosts;
}

export function normalizeReferrer(raw: string, requestHost?: string) {
  const value = raw.trim();
  if (!value) return "";
  const hosts = ownHosts(requestHost);
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (hosts.has(host)) return "";
    return host;
  } catch {
    return value.slice(0, 200);
  }
}

function mergeCounts(rows: { key: string; count: number }[]) {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.key, (map.get(row.key) ?? 0) + row.count);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export function pageLabel(path: string, titles: Map<string, string>) {
  if (path === "/") return "Home";
  if (path === "/work") return "Work";
  if (path === "/resume") return "Resume";
  const section = homeSectionFromPathname(path);
  if (section) return section.label;
  const match = /^\/work\/([^/?#]+)/.exec(path);
  if (match) return titles.get(match[1]) ?? match[1];
  return path;
}

export function localDateKey(timeZone: string, date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function localHour(timeZone: string, date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(date),
  );
}

export function localDayStart(timeZone: string, date = new Date()) {
  const hour = localHour(timeZone, date);
  const minute = Number(
    new Intl.DateTimeFormat("en-US", { timeZone, minute: "numeric" }).format(date),
  );
  return new Date(date.getTime() - (hour * 60 + minute) * 60 * 1000);
}

export async function getAnalytics(days = 30): Promise<AnalyticsSummary> {
  return getAnalyticsSince(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

export async function getAnalyticsSince(since: Date): Promise<AnalyticsSummary> {
  const empty: AnalyticsSummary = {
    views: 0,
    uniques: 0,
    pages: [],
    referrers: [],
    countries: [],
    cities: [],
    geoUnavailable: false,
  };
  if (!hasMongo()) return empty;
  await connectDb();
  const match = { createdAt: { $gte: since } };

  const [views, uniqueDocs, pages, referrers, countries, cities, projects] = await Promise.all([
    PageViewModel.countDocuments(match),
    PageViewModel.distinct("visitorHash", match),
    PageViewModel.aggregate([
      { $match: match },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]),
    PageViewModel.aggregate([{ $match: match }, { $group: { _id: "$referrer", count: { $sum: 1 } } }]),
    PageViewModel.aggregate([
      { $match: match },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 16 },
    ]),
    PageViewModel.aggregate([
      { $match: { ...match, lat: { $type: "number" }, lng: { $type: "number" } } },
      {
        $group: {
          _id: { city: "$city", country: "$country", lat: "$lat", lng: "$lng" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 40 },
    ]),
    ProjectModel.find().select("slug title").lean(),
  ]);

  const titles = new Map(
    projects.map((project) => [String(project.slug), String(project.title ?? project.slug)]),
  );

  const labeledPages = pages.map((row: { _id: string; count: number }) => {
    const path = row._id || "/";
    return { path, label: pageLabel(path, titles), count: row.count };
  });

  const mergedReferrers = mergeCounts(
    referrers.map((row: { _id: string; count: number }) => ({
      key: normalizeReferrer(row._id ?? "") || "(direct)",
      count: row.count,
    })),
  ).slice(0, 12);

  const countryRows = mergeCounts(
    countries.map((row: { _id: string; count: number }) => ({
      key: row._id || "Unknown",
      count: row.count,
    })),
  ).map((row) => ({ country: row.key, count: row.count }));

  return {
    views,
    uniques: uniqueDocs.length,
    pages: labeledPages,
    referrers: mergedReferrers.map((row) => ({ referrer: row.key, count: row.count })),
    countries: countryRows,
    cities: cities.map(
      (row: { _id: { city: string; country: string; lat?: number; lng?: number }; count: number }) => ({
        city: row._id.city || row._id.country || "Unknown",
        country: row._id.country,
        lat: row._id.lat,
        lng: row._id.lng,
        count: row.count,
      }),
    ),
    geoUnavailable:
      views > 0 &&
      countryRows.every((row) => row.country === "Local / private IP" || row.country === "Unknown"),
  };
}
