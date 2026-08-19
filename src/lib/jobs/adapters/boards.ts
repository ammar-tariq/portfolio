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
  const data = await fetchJobJson<unknown>("https://himalayas.app/jobs/api?limit=100");
  const root = asRecord(data);
  const jobs = asList(root.jobs ?? root.data ?? (Array.isArray(data) ? data : []));
  return jobs.map((item) => {
    const row = asRecord(item);
    const location = text(
      asList(row.locationRestrictions).map(String).join(", ") ||
        row.location ||
        row.country ||
        asList(row.locations).map(String).join(", "),
      200,
    );
    const applyUrl = text(row.applicationLink || row.url || row.jobUrl, 500);
    const description = clipText(stripHtml(text(row.description || row.excerpt, 40000)));
    return {
      source: "himalayas" as const,
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.guid || row.slug || row.id, 80),
      title: text(row.title, 200),
      company: text(asRecord(row.company).name || row.companyName || row.company, 160),
      location,
      remote: true,
      descriptionText: description,
      postedAt: postedDate(row.pubDate || row.publishedAt || row.createdAt),
    };
  });
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

function rssItems(xml: string) {
  return xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
}

function rssField(block: string, tag: string) {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i").exec(block);
  if (cdata) return cdata[1] ?? "";
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  return plain?.[1] ?? "";
}

export async function fetchWeWorkRemotelyJobs(): Promise<NormalizedJob[]> {
  const result = await fetchJobFeed("https://weworkremotely.com/remote-jobs.rss");
  if (!result.ok) throw new Error(result.error);
  return rssItems(result.text).map((block) => {
    const titleRaw = stripHtml(rssField(block, "title"));
    const applyUrl = stripHtml(rssField(block, "link"));
    const description = clipText(stripHtml(rssField(block, "description")));
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
      postedAt: postedDate(stripHtml(rssField(block, "pubDate"))),
    };
  });
}

export async function fetchUsaJobs(): Promise<NormalizedJob[]> {
  if (!hasUsajobs()) return [];
  const key = process.env.USAJOBS_API_KEY!.trim();
  const agent = process.env.USAJOBS_USER_AGENT!.trim();
  const url =
    "https://data.usajobs.gov/api/search?ResultsPerPage=50&SortField=opendate&SortDirection=desc";
  const data = await fetchJobJson<Record<string, unknown>>(url, {
    headers: {
      Host: "data.usajobs.gov",
      "User-Agent": `${agent} ${jobUserAgent()}`,
      "Authorization-Key": key,
    },
  });
  const search = asRecord(data.SearchResult);
  const items = asList(search.SearchResultItems);
  return items.map((item) => {
    const descriptor = asRecord(asRecord(item).MatchedObjectDescriptor);
    const location = asList(descriptor.PositionLocation)
      .map((loc) => text(asRecord(loc).LocationName, 80))
      .filter(Boolean)
      .slice(0, 3)
      .join("; ");
    const applyUrl = text(descriptor.PositionURI, 500);
    const description = clipText(
      stripHtml(text(descriptor.UserArea ? asRecord(asRecord(descriptor.UserArea).Details).JobSummary : descriptor.QualificationSummary, 40000)),
    );
    const announcement = text(descriptor.PositionID || descriptor.PositionURI, 80);
    return {
      source: "usajobs" as const,
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: announcement,
      announcementNumber: text(descriptor.PositionID, 80),
      title: text(descriptor.PositionTitle, 200),
      company: text(descriptor.OrganizationName || descriptor.DepartmentName, 160) || "USAJOBS",
      location,
      remote: looksRemote(location, text(descriptor.PositionTitle), description) || /remote/i.test(text(descriptor.PositionSchedule)),
      descriptionText: description,
      postedAt: postedDate(descriptor.PublicationStartDate),
    };
  });
}
