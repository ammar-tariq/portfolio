import type { CompanyWatch, JobListing, JobPollState, ListingStatus } from "@/types/job-search";
import {
  LISTING_STATUSES,
  normalizePostedWithinDays,
  normalizeRequiredSkillGroups,
  resolveEnabledBoards,
} from "@/types/job-search";

function str(value: unknown, max = 8000) {
  if (value == null) return "";
  return String(value).trim().slice(0, max);
}

export function listingFromDoc(doc: unknown): JobListing {
  const data = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
  const status = LISTING_STATUSES.includes(data.status as ListingStatus) ? (data.status as ListingStatus) : "seen";
  return {
    id: str(data._id || data.id, 80),
    source: data.source as JobListing["source"],
    canonicalKey: str(data.canonicalKey, 600),
    applyUrl: str(data.applyUrl, 500),
    sourceUrls: Array.isArray(data.sourceUrls) ? data.sourceUrls.map((url) => str(url, 500)).filter(Boolean) : [],
    atsJobId: str(data.atsJobId, 120) || undefined,
    boardToken: str(data.boardToken, 120) || undefined,
    title: str(data.title, 200),
    company: str(data.company, 160),
    location: str(data.location, 200),
    remote: Boolean(data.remote),
    descriptionText: str(data.descriptionText, 20000),
    postedAt: data.postedAt ? new Date(String(data.postedAt)).toISOString() : undefined,
    discoveredAt: data.createdAt ? new Date(String(data.createdAt)).toISOString() : undefined,
    titleCompanyLocationHash: str(data.titleCompanyLocationHash, 64),
    priorityScore: Number(data.priorityScore) || 0,
    eligibilityNotes: str(data.eligibilityNotes, 400),
    visaLanguage: Boolean(data.visaLanguage),
    citizenshipRequirement: Boolean(data.citizenshipRequirement),
    stackMatches: Array.isArray(data.stackMatches)
      ? data.stackMatches.map((item) => str(item, 80)).filter(Boolean)
      : [],
    requiredMatches: Array.isArray(data.requiredMatches)
      ? data.requiredMatches.map((item) => str(item, 80)).filter(Boolean)
      : [],
    status,
    applicationId: str(data.applicationId, 80) || undefined,
    updatedAt: data.updatedAt ? new Date(String(data.updatedAt)).toISOString() : undefined,
  };
}

export function watchFromDoc(doc: unknown): CompanyWatch {
  const data = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
  return {
    id: str(data._id || data.id, 80),
    name: str(data.name, 160),
    ats: data.ats as CompanyWatch["ats"],
    token: str(data.token, 120),
    enabled: data.enabled !== false,
    lastPolledAt: data.lastPolledAt ? new Date(String(data.lastPolledAt)).toISOString() : undefined,
    lastError: str(data.lastError, 400) || undefined,
    createdAt: data.createdAt ? new Date(String(data.createdAt)).toISOString() : undefined,
  };
}

export function pollStateFromDoc(doc: unknown): JobPollState {
  const data = (doc ? JSON.parse(JSON.stringify(doc)) : {}) as Record<string, unknown>;
  const errors = Array.isArray(data.adapterErrors) ? data.adapterErrors : [];
  return {
    lastRunAt: data.lastRunAt ? new Date(String(data.lastRunAt)).toISOString() : undefined,
    lastError: str(data.lastError, 400) || undefined,
    adapterErrors: errors.map((item) => {
      const row = item as Record<string, unknown>;
      return { adapter: str(row.adapter, 80), error: str(row.error, 400) };
    }),
    lastAdded: Number(data.lastAdded) || 0,
    lastUpdated: Number(data.lastUpdated) || 0,
    lastSkippedRole: Number(data.lastSkippedRole) || 0,
    enabledBoards: resolveEnabledBoards(
      Array.isArray(data.enabledBoards) ? data.enabledBoards.map(String) : [],
      Number(data.enabledBoardsVersion) || 0,
    ),
    includeCompanyAts: Boolean(data.includeCompanyAts),
    postedWithinDays: normalizePostedWithinDays(data.postedWithinDays),
    requiredSkillGroups: normalizeRequiredSkillGroups(data.requiredSkillGroups),
  };
}
