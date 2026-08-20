import { clipText, stripHtml } from "@/lib/jobs/canonical";
import { fetchJobFeed, fetchJobJson } from "@/lib/jobs/http";
import { asList, asRecord, postedDate, text, type NormalizedJob } from "@/lib/jobs/normalize";
import { looksRemote } from "@/lib/jobs/role-filter";
import type { WatchAts } from "@/types/job-search";

function locationFromUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  const row = asRecord(value);
  return text(row.name || row.location || row.city || [row.city, row.region, row.country].filter(Boolean).join(", "));
}

export async function fetchGreenhouseJobs(token: string, company: string): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<{ jobs?: unknown[] }>(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs?content=true`,
  );
  return asList(data.jobs).map((item) => {
    const row = asRecord(item);
    const location = locationFromUnknown(row.location);
    const applyUrl = text(row.absolute_url, 500);
    return {
      source: "greenhouse",
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.id, 80),
      boardToken: token,
      title: text(row.title, 200),
      company: company || token,
      location,
      remote: looksRemote(location, text(row.title), stripHtml(text(row.content, 20000))),
      descriptionText: clipText(stripHtml(text(row.content, 40000))),
      postedAt: postedDate(row.updated_at || row.created_at),
    };
  });
}

export async function fetchLeverJobs(token: string, company: string): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<unknown[]>(
    `https://api.lever.co/v0/postings/${encodeURIComponent(token)}?mode=json`,
  );
  return asList(data).map((item) => {
    const row = asRecord(item);
    const cats = asRecord(row.categories);
    const location = text(cats.location || row.location, 200);
    const applyUrl = text(row.hostedUrl || row.applyUrl, 500);
    const description = clipText(text(row.descriptionPlain, 20000) || stripHtml(text(row.description, 40000)));
    return {
      source: "lever",
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.id, 80),
      boardToken: token,
      title: text(row.text, 200),
      company: company || token,
      location,
      remote: looksRemote(location, text(row.text), description) || /remote/i.test(text(cats.commitment)),
      descriptionText: description,
      postedAt: postedDate(row.createdAt),
    };
  });
}

export async function fetchAshbyJobs(token: string, company: string): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<Record<string, unknown>>(
    `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(token)}?includeCompensation=true`,
  );
  const jobs = asList(data.jobs ?? data.postings);
  return jobs.map((item) => {
    const row = asRecord(item);
    const location = locationFromUnknown(row.location);
    const applyUrl = text(row.jobUrl || row.applyUrl || row.jobUrlId, 500);
    const description = clipText(stripHtml(text(row.descriptionHtml || row.descriptionPlain || row.description, 40000)));
    return {
      source: "ashby",
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.id || row.jobId, 80),
      boardToken: token,
      title: text(row.title, 200),
      company: company || token,
      location,
      remote: Boolean(row.isRemote) || looksRemote(location, text(row.title), description),
      descriptionText: description,
      postedAt: postedDate(row.publishedAt || row.publishedDate || row.updatedAt),
    };
  });
}

export async function fetchWorkableJobs(token: string, company: string): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<Record<string, unknown>>(
    `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(token)}`,
  );
  return asList(data.jobs).map((item) => {
    const row = asRecord(item);
    const loc = asRecord(row.location);
    const location = text(loc.city || loc.region || loc.country || row.city, 200);
    const applyUrl = text(row.url || row.application_url, 500);
    const description = clipText(stripHtml(text(row.description, 40000)));
    return {
      source: "workable",
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.shortcode || row.id, 80),
      boardToken: token,
      title: text(row.title, 200),
      company: company || token,
      location,
      remote: Boolean(row.remote) || looksRemote(location, text(row.title), description),
      descriptionText: description,
      postedAt: postedDate(row.created_at || row.published_on),
    };
  });
}

export async function fetchRecruiteeJobs(token: string, company: string): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<Record<string, unknown>>(
    `https://${encodeURIComponent(token)}.recruitee.com/api/offers/`,
  );
  return asList(data.offers).map((item) => {
    const row = asRecord(item);
    const location = text(row.location || row.city, 200);
    const applyUrl = text(row.careers_url || row.url, 500);
    const description = clipText(stripHtml(text(row.description || row.requirements, 40000)));
    return {
      source: "recruitee",
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.slug || row.id, 80),
      boardToken: token,
      title: text(row.title, 200),
      company: company || token,
      location,
      remote: Boolean(row.remote) || looksRemote(location, text(row.title), description),
      descriptionText: description,
      postedAt: postedDate(row.published_at || row.created_at),
    };
  });
}

function xmlTag(block: string, tag: string) {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  return match ? stripHtml(match[1] ?? "") : "";
}

export async function fetchPersonioJobs(token: string, company: string): Promise<NormalizedJob[]> {
  const result = await fetchJobFeed(`https://${encodeURIComponent(token)}.jobs.personio.de/xml?language=en`);
  if (!result.ok) throw new Error(result.error);
  const positions = result.text.match(/<position\b[\s\S]*?<\/position>/gi) ?? [];
  return positions.map((block) => {
    const title = xmlTag(block, "name");
    const office = xmlTag(block, "office");
    const applyUrl = xmlTag(block, "url") || `https://${token}.jobs.personio.de`;
    const descriptions = [...block.matchAll(/<jobDescription>[\s\S]*?<value>([\s\S]*?)<\/value>/gi)]
      .map((row) => stripHtml(row[1] ?? ""))
      .join("\n");
    return {
      source: "personio" as const,
      applyUrl,
      sourceUrls: [applyUrl],
      atsJobId: xmlTag(block, "id"),
      boardToken: token,
      title,
      company: company || xmlTag(block, "subcompany") || token,
      location: office,
      remote: looksRemote(office, title, descriptions) || /remote/i.test(xmlTag(block, "schedule")),
      descriptionText: clipText(descriptions),
      postedAt: postedDate(xmlTag(block, "createdAt")),
    };
  });
}

export async function fetchBreezyJobs(token: string, company: string): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<unknown[]>(`https://${encodeURIComponent(token)}.breezy.hr/json`);
  return asList(data).map((item) => {
    const row = asRecord(item);
    const loc = asRecord(row.location);
    const location = text(loc.name || loc.city || row.location, 200);
    const applyUrl = text(row.url || row.published_url, 500);
    const description = clipText(stripHtml(text(row.description, 40000)));
    return {
      source: "breezy",
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.id, 80),
      boardToken: token,
      title: text(row.name || row.title, 200),
      company: company || token,
      location,
      remote: looksRemote(location, text(row.name), description),
      descriptionText: description,
      postedAt: postedDate(row.published_date || row.created_at),
    };
  });
}

export async function fetchSmartRecruitersJobs(token: string, company: string): Promise<NormalizedJob[]> {
  const PAGE = 100;
  const MAX = 500;
  const out: NormalizedJob[] = [];
  let offset = 0;
  // SmartRecruiters paginates with limit/offset. Loop until a page is short or we hit the safety cap.
  while (offset < MAX) {
    const data = await fetchJobJson<Record<string, unknown>>(
      `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(token)}/postings?limit=${PAGE}&offset=${offset}`,
    );
    const page = asList(data.content);
    for (const item of page) {
      const row = asRecord(item);
      const loc = asRecord(row.location);
      const location = [loc.city, loc.region, loc.country].filter(Boolean).map(String).join(", ");
      const applyUrl = text(
        asRecord(row.ref).jobAd || `https://jobs.smartrecruiters.com/${token}/${row.id}`,
        500,
      );
      const ad = asRecord(row.jobAd);
      const sections = asRecord(ad.sections);
      const description = clipText(
        stripHtml(
          text(asRecord(sections.jobDescription).text, 20000) +
            " " +
            text(asRecord(sections.qualifications).text, 20000),
        ),
      );
      out.push({
        source: "smartrecruiters",
        applyUrl,
        sourceUrls: applyUrl ? [applyUrl] : [],
        atsJobId: text(row.id, 80),
        boardToken: token,
        title: text(row.name, 200),
        company: company || token,
        location,
        remote: looksRemote(location, text(row.name), description) || /remote/i.test(text(asRecord(row.location).remote)),
        descriptionText: description,
        postedAt: postedDate(row.releasedDate),
      });
    }
    if (page.length < PAGE) break;
    offset += PAGE;
  }
  return out;
}

export async function fetchBambooHrJobs(token: string, company: string): Promise<NormalizedJob[]> {
  const data = await fetchJobJson<Record<string, unknown>>(
    `https://${encodeURIComponent(token)}.bamboohr.com/careers/list`,
  );
  const rows = asList(data.result ?? data.meta ?? data.jobs);
  return rows.map((item) => {
    const row = asRecord(item);
    const location = text(row.location || row.atsLocation, 200);
    const applyUrl = text(row.jobOpeningShareUrl || row.url, 500);
    const description = clipText(stripHtml(text(row.description, 40000)));
    return {
      source: "bamboohr",
      applyUrl,
      sourceUrls: applyUrl ? [applyUrl] : [],
      atsJobId: text(row.id || row.jobOpeningId, 80),
      boardToken: token,
      title: text(row.jobOpeningName || row.title, 200),
      company: company || token,
      location,
      remote: looksRemote(location, text(row.jobOpeningName), description),
      descriptionText: description,
      postedAt: postedDate(row.datePosted),
    };
  });
}

const fetchers: Record<WatchAts, (token: string, company: string) => Promise<NormalizedJob[]>> = {
  greenhouse: fetchGreenhouseJobs,
  lever: fetchLeverJobs,
  ashby: fetchAshbyJobs,
  workable: fetchWorkableJobs,
  recruitee: fetchRecruiteeJobs,
  personio: fetchPersonioJobs,
  breezy: fetchBreezyJobs,
  smartrecruiters: fetchSmartRecruitersJobs,
  bamboohr: fetchBambooHrJobs,
};

export async function fetchWatchJobs(ats: WatchAts, token: string, company: string) {
  return fetchers[ats](token, company);
}
