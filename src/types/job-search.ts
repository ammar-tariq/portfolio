export const WATCH_ATS = [
  "greenhouse",
  "lever",
  "ashby",
  "workable",
  "recruitee",
  "personio",
  "breezy",
  "smartrecruiters",
  "bamboohr",
] as const;

export type WatchAts = (typeof WATCH_ATS)[number];

export const BOARD_SOURCES = [
  "remote-ok",
  "remotive",
  "himalayas",
  "arbeitnow",
  "we-work-remotely",
  "usajobs",
] as const;

export type BoardSource = (typeof BOARD_SOURCES)[number];

export const BOARD_LABELS: Record<BoardSource, string> = {
  "remote-ok": "Remote OK",
  remotive: "Remotive",
  himalayas: "Himalayas",
  arbeitnow: "Arbeitnow",
  "we-work-remotely": "We Work Remotely",
  usajobs: "USAJOBS",
};

export const DEFAULT_ENABLED_BOARDS: BoardSource[] = [
  "remote-ok",
  "remotive",
  "himalayas",
  "arbeitnow",
  "we-work-remotely",
];

export type JobSource = WatchAts | BoardSource;

export const LISTING_STATUSES = ["seen", "saved", "skipped", "drafted", "applied", "hidden"] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number];

export type CompanyWatch = {
  id: string;
  name: string;
  ats: WatchAts;
  token: string;
  enabled: boolean;
  lastPolledAt?: string;
  lastError?: string;
  createdAt?: string;
};

export type JobListing = {
  id: string;
  source: JobSource;
  canonicalKey: string;
  applyUrl: string;
  sourceUrls: string[];
  atsJobId?: string;
  boardToken?: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  descriptionText: string;
  postedAt?: string;
  discoveredAt?: string;
  titleCompanyLocationHash: string;
  priorityScore: number;
  eligibilityNotes: string;
  visaLanguage: boolean;
  citizenshipRequirement: boolean;
  stackMatches: string[];
  status: ListingStatus;
  applicationId?: string;
  updatedAt?: string;
};

export type AdapterError = {
  adapter: string;
  error: string;
};

export type JobPollState = {
  lastRunAt?: string;
  lastError?: string;
  adapterErrors: AdapterError[];
  lastAdded: number;
  lastUpdated: number;
  lastSkippedRole: number;
  enabledBoards: BoardSource[];
  includeCompanyAts: boolean;
};

export type JobPollResult = {
  ok: true;
  added: number;
  updated: number;
  skippedRole: number;
  adapterErrors: AdapterError[];
};
