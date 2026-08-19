import { clipText, stripHtml } from "@/lib/jobs/canonical";
import { fetchJobFeed, fetchJobJson, jobUserAgent } from "@/lib/jobs/http";
import { asList, asRecord, postedDate, text, type NormalizedJob } from "@/lib/jobs/normalize";
import { looksRemote } from "@/lib/jobs/role-filter";
import { hasUsajobs } from "@/lib/env";

export async function fetchRemoteOkJobs(): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<unknown[]>("https://remoteok.com/api");
  return asList(data)
    .map((item) => asRecord(item))
    .filter((row) => text(row.id) && text(row.position || row.title))
    .map((row) => {
      const location = text(row.location, 200);
      const applyUrl = text(row.url || row.apply_url, 500);
      const description = clipText(stripHtml(text(row.description, 40000)));
      return {
        source: "remote-ok" as const,
        applyUrl,
        sourceUrls: applyUrl ? [applyUrl] : [],
        atsJobId: text(row.id, 80),
        title: text(row.position || row.title, 200),
        company: text(row.company, 160) || "Remote OK",
        location,
        remote: true,
        descriptionText: description,
        postedAt: postedDate(row.date || row.epoch),
      };
    });
}

export async function fetchRemotiveJobs(): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<Record<string, unknown>>("https://remotive.com/api/remote-jobs");
  return asList(data.jobs).map((item) => {
    const row = asRecord(item);
    const location = text(row.candidate_required_location, 200);
    const applyUrl = text(row.url, 500);
    const description = clipText(stripHtml(text(row.description, 40000)));
    return {
      source: "remotive" as const,
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.id, 80),
      title: text(row.title, 200),
      company: text(row.company_name, 160),
      location,
      remote: true,
      descriptionText: description,
      postedAt: postedDate(row.publication_date),
    };
  });
}

export async function fetchHimalayasJobs(): Promise<NormalizedJob[]> {
  const pages = [0, 100];
  const jobs: NormalizedJob[] = [];
  const seen = new Set<string>();
  for (const offset of pages) {
    const data = await fetchJobJson<unknown>(`https://himalayas.app/jobs/api?limit=100&offset=${offset}`);
    const root = asRecord(data);
    const rows = asList(root.jobs ?? root.data ?? (Array.isArray(data) ? data : []));
    for (const item of rows) {
      const row = asRecord(item);
      const location = text(
        asList(row.locationRestrictions).map(String).join(", ") ||
          row.location ||
          row.country ||
          asList(row.locations).map(String).join(", "),
        200,
      );
      const applyUrl = text(row.applicationLink || row.url || row.jobUrl, 500);
      if (!applyUrl || seen.has(applyUrl)) continue;
      seen.add(applyUrl);
      const description = clipText(stripHtml(text(row.description || row.excerpt, 40000)));
      jobs.push({
        source: "himalayas",
        applyUrl,
        sourceUrls: [applyUrl],
        atsJobId: text(row.guid || row.slug || row.id, 80),
        title: text(row.title, 200),
        company: text(asRecord(row.company).name || row.companyName || row.company, 160),
        location,
        remote: true,
        descriptionText: description,
        postedAt: postedDate(row.pubDate || row.publishedAt || row.createdAt),
      });
    }
  }
  return jobs;
}

export async function fetchArbeitnowJobs(): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<Record<string, unknown>>("https://www.arbeitnow.com/api/job-board-api");
  return asList(data.data).map((item) => {
    const row = asRecord(item);
    const location = text(row.location, 200);
    const applyUrl = text(row.url, 500);
    const description = clipText(stripHtml(text(row.description, 40000)));
    return {
      source: "arbeitnow" as const,
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.slug, 120),
      title: text(row.title, 200),
      company: text(row.company_name, 160),
      location,
      remote: Boolean(row.remote) || looksRemote(location, text(row.title), description),
      descriptionText: description,
      postedAt: postedDate(row.created_at),
    };
  });
}

function xmlBlocks(xml: string, tag: string) {
  return xml.match(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, "gi")) ?? [];
}

function xmlField(block: string, tag: string) {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i").exec(block);
  if (cdata) return cdata[1] ?? "";
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  return plain?.[1] ?? "";
}

function xmlHref(block: string) {
  const attr = /<link[^>]*href="([^"]+)"/i.exec(block);
  if (attr?.[1]) return decodeXml(attr[1]);
  return decodeXml(xmlField(block, "link"));
}

function decodeXml(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function dedupeJobs(jobs: NormalizedJob[]) {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = job.applyUrl || `${job.source}:${job.atsJobId}:${job.title}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const WWR_FEEDS = [
  "https://weworkremotely.com/remote-jobs.rss",
  "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
  "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
  "https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss",
  "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
];

function jobsFromWwrRss(xml: string): NormalizedJob[] {
  return xmlBlocks(xml, "item").map((block) => {
    const titleRaw = stripHtml(xmlField(block, "title"));
    const applyUrl = stripHtml(xmlHref(block));
    const description = clipText(stripHtml(xmlField(block, "description")));
    const split = titleRaw.split(/:\s+/);
    const company = split.length > 1 ? split[0]?.trim() ?? "" : "";
    const title = split.length > 1 ? split.slice(1).join(": ").trim() : titleRaw;
    return {
      source: "we-work-remotely" as const,
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      title: title.slice(0, 200),
      company: company.slice(0, 160) || "We Work Remotely",
      location: "Remote",
      remote: true,
      descriptionText: description,
      postedAt: postedDate(stripHtml(xmlField(block, "pubDate"))),
    };
  });
}

export async function fetchWeWorkRemotelyJobs(): Promise<NormalizedJob[]> {
  const batches = await Promise.all(
    WWR_FEEDS.map(async (url) => {
      const result = await fetchJobFeed(url);
      if (!result.ok) return [] as NormalizedJob[];
      return jobsFromWwrRss(result.text);
    }),
  );
  const jobs = dedupeJobs(batches.flat());
  if (!jobs.length) throw new Error("We Work Remotely feeds failed.");
  return jobs;
}

export async function fetchJobicyJobs(): Promise<NormalizedJob[]> {
  const urls = [
    "https://jobicy.com/api/v2/remote-jobs?count=100",
    "https://jobicy.com/api/v2/remote-jobs?count=50&industry=Engineering",
  ];
  const jobs: NormalizedJob[] = [];
  for (const url of urls) {
    const data = await fetchJobJson<Record<string, unknown>>(url);
    for (const item of asList(data.jobs)) {
      const row = asRecord(item);
      const applyUrl = text(row.url, 500);
      const location = text(row.jobGeo, 200);
      const description = clipText(stripHtml(text(row.jobDescription || row.jobExcerpt, 40000)));
      jobs.push({
        source: "jobicy",
        applyUrl,
        sourceUrls: applyUrl ? [applyUrl] : [],
        atsJobId: text(row.id || row.jobSlug, 80),
        title: text(row.jobTitle, 200),
        company: text(row.companyName, 160) || "Jobicy",
        location,
        remote: true,
        descriptionText: description,
        postedAt: postedDate(row.pubDate),
      });
    }
  }
  return dedupeJobs(jobs);
}

export async function fetchWorkingNomadsJobs(): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<unknown>("https://www.workingnomads.com/api/exposed_jobs/");
  return asList(data).map((item) => {
    const row = asRecord(item);
    const applyUrl = text(row.url || row.apply_url, 500);
    const location = text(row.location, 200);
    const description = clipText(stripHtml(text(row.description, 40000)));
    return {
      source: "working-nomads" as const,
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.id, 80),
      title: text(row.title, 200),
      company: text(row.company_name || row.company, 160) || "Working Nomads",
      location,
      remote: true,
      descriptionText: description,
      postedAt: postedDate(row.pub_date),
    };
  });
}

export async function fetchMuseJobs(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];
  for (let page = 0; page < 4; page += 1) {
    const data = await fetchJobJson<Record<string, unknown>>(
      `https://www.themuse.com/api/public/jobs?page=${page}&descending=true&category=Software%20Engineering`,
    );
    for (const item of asList(data.results)) {
      const row = asRecord(item);
      const company = asRecord(row.company);
      const refs = asRecord(row.refs);
      const applyUrl = text(refs.landing_page || row.landing_page, 500);
      const location = asList(row.locations)
        .map((loc) => text(asRecord(loc).name, 80))
        .filter(Boolean)
        .slice(0, 3)
        .join("; ");
      jobs.push({
        source: "the-muse",
        applyUrl,
        sourceUrls: applyUrl ? [applyUrl] : [],
        atsJobId: text(row.id, 80),
        title: text(row.name, 200),
        company: text(company.name, 160) || "The Muse",
        location,
        remote: looksRemote(location, text(row.name), stripHtml(text(row.contents, 2000))),
        descriptionText: clipText(stripHtml(text(row.contents, 40000))),
        postedAt: postedDate(row.publication_date),
      });
    }
  }
  return dedupeJobs(jobs);
}

type HnHit = { title?: string; objectID?: string };
type HnComment = { id?: number | string; text?: string; children?: HnComment[] };

function flattenHnComments(nodes: HnComment[] | undefined, out: HnComment[] = []) {
  for (const node of nodes ?? []) {
    if (node.text) out.push(node);
    if (node.children?.length) flattenHnComments(node.children, out);
  }
  return out;
}

function firstHttpUrl(value: string) {
  const match = /https?:\/\/[^\s"'<>]+/i.exec(value);
  return match?.[0]?.replace(/[).,]+$/, "") ?? "";
}

export async function fetchHnWhoIsHiringJobs(): Promise<NormalizedJob[]> {
  const search = await fetchJobJson<{ hits?: HnHit[] }>(
    "https://hn.algolia.com/api/v1/search_by_date?query=Who%20is%20hiring&tags=story,author_whoishiring&hitsPerPage=8",
  );
  const thread = (search.hits ?? []).find(
    (hit) => /who is hiring/i.test(String(hit.title ?? "")) && !/who wants to be hired/i.test(String(hit.title ?? "")),
  );
  const objectId = text(thread?.objectID, 20);
  if (!objectId) return [];
  const item = await fetchJobJson<HnComment>(`https://hn.algolia.com/api/v1/items/${objectId}`);
  const comments = flattenHnComments(item.children).slice(0, 180);
  return comments.flatMap((comment) => {
    const raw = decodeXml(String(comment.text ?? ""));
    const description = clipText(stripHtml(raw));
    if (!description) return [];
    const href = [...raw.matchAll(/href="([^"]+)"/gi)]
      .map((match) => decodeXml(match[1] ?? ""))
      .find((url) => /^https?:\/\//i.test(url) && !/news\.ycombinator\.com/i.test(url));
    const applyUrl =
      href ||
      firstHttpUrl(description) ||
      `https://news.ycombinator.com/item?id=${comment.id ?? objectId}`;
    const firstLine = description.split(/\n/)[0] ?? description;
    const parts = firstLine.split("|").map((part) => part.trim()).filter(Boolean);
    const company = (parts[0] || "HN company").slice(0, 160);
    const title = (parts[1] || parts[0] || "Role").slice(0, 200);
    const location = parts.slice(2).join(" · ").slice(0, 200) || "Remote";
    return [
      {
        source: "hn-who-is-hiring" as const,
        applyUrl,
        sourceUrls: applyUrl ? [applyUrl] : [],
        atsJobId: text(comment.id, 80),
        title,
        company,
        location,
        remote: looksRemote(location, title, description),
        descriptionText: description,
      },
    ];
  });
}

export async function fetchLandingJobs(): Promise<NormalizedJob[]> {
  const result = await fetchJobFeed("https://landing.jobs/feed");
  if (!result.ok) throw new Error(result.error);
  return xmlBlocks(result.text, "entry").map((block) => {
    const applyUrl = xmlHref(block);
    const title = stripHtml(xmlField(block, "title"));
    const content = xmlField(block, "content") || xmlField(block, "summary");
    const description = clipText(stripHtml(content));
    const id = xmlField(block, "id");
    const slug = /\/at\/([^/]+)\//.exec(id)?.[1]?.replace(/-/g, " ") ?? "";
    const atLine = /At ([^<(]+)/i.exec(description)?.[1]?.trim() ?? "";
    const company = (atLine.replace(/\s*\(.*$/, "") || slug || "Landing.jobs").slice(0, 160);
    const location = /in ([^<]+)/i.exec(description.split("Expires")[0] ?? "")?.[1]?.trim().slice(0, 200) ?? "";
    return {
      source: "landing-jobs" as const,
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: stripHtml(id).slice(0, 80),
      title: title.slice(0, 200),
      company,
      location: location || "Europe",
      remote: /remote/i.test(description) || looksRemote(location, title, description),
      descriptionText: description,
      postedAt: postedDate(stripHtml(xmlField(block, "published") || xmlField(block, "updated"))),
    };
  });
}

export async function fetchUsaJobs(): Promise<NormalizedJob[]> {
  if (!hasUsajobs()) return [];
  const key = process.env.USAJOBS_API_KEY!.trim();
  const agent = process.env.USAJOBS_USER_AGENT!.trim();
  const headers = {
    Host: "data.usajobs.gov",
    "User-Agent": `${agent} ${jobUserAgent()}`,
    "Authorization-Key": key,
  };
  const queries = [
    "ResultsPerPage=50&SortField=opendate&SortDirection=desc",
    "ResultsPerPage=50&Keyword=software%20engineer&SortField=opendate&SortDirection=desc",
  ];
  const jobs: NormalizedJob[] = [];
  for (const query of queries) {
    const data = await fetchJobJson<Record<string, unknown>>(`https://data.usajobs.gov/api/search?${query}`, {
      headers,
    });
    const items = asList(asRecord(data.SearchResult).SearchResultItems);
    for (const item of items) {
      const descriptor = asRecord(asRecord(item).MatchedObjectDescriptor);
      const location = asList(descriptor.PositionLocation)
        .map((loc) => text(asRecord(loc).LocationName, 80))
        .filter(Boolean)
        .slice(0, 3)
        .join("; ");
      const applyUrl = text(descriptor.PositionURI, 500);
      const description = clipText(
        stripHtml(
          text(
            descriptor.UserArea ? asRecord(asRecord(descriptor.UserArea).Details).JobSummary : descriptor.QualificationSummary,
            40000,
          ),
        ),
      );
      const announcement = text(descriptor.PositionID || descriptor.PositionURI, 80);
      jobs.push({
        source: "usajobs",
        applyUrl,
        sourceUrls: applyUrl ? [applyUrl] : [],
        atsJobId: announcement,
        announcementNumber: text(descriptor.PositionID, 80),
        title: text(descriptor.PositionTitle, 200),
        company: text(descriptor.OrganizationName || descriptor.DepartmentName, 160) || "USAJOBS",
        location,
        remote:
          looksRemote(location, text(descriptor.PositionTitle), description) ||
          /remote/i.test(text(descriptor.PositionSchedule)),
        descriptionText: description,
        postedAt: postedDate(descriptor.PublicationStartDate),
      });
    }
  }
  return dedupeJobs(jobs);
}
