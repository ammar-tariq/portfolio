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
  "jobicy",
  "working-nomads",
  "the-muse",
  "hn-who-is-hiring",
  "landing-jobs",
  "nodesk",
  "get-on-board",
  "jobspresso",
  "the-hub",
  "agentic-jobs",
  "a16z-speedrun",
  "usajobs",
] as const;

export type BoardSource = (typeof BOARD_SOURCES)[number];

/** Boards that existed before extra feeds were added. Used to auto-enable newcomers. */
export const LEGACY_BOARD_SOURCES: BoardSource[] = [
  "remote-ok",
  "remotive",
  "himalayas",
  "arbeitnow",
  "we-work-remotely",
  "jobicy",
  "working-nomads",
  "the-muse",
  "hn-who-is-hiring",
  "landing-jobs",
  "usajobs",
];

export const BOARD_LABELS: Record<BoardSource, string> = {
  "remote-ok": "Remote OK",
  remotive: "Remotive",
  himalayas: "Himalayas",
  arbeitnow: "Arbeitnow",
  "we-work-remotely": "We Work Remotely",
  jobicy: "Jobicy",
  "working-nomads": "Working Nomads",
  "the-muse": "The Muse",
  "hn-who-is-hiring": "HN Who's Hiring",
  "landing-jobs": "Landing.jobs",
  nodesk: "NoDesk",
  "get-on-board": "Get on Board",
  jobspresso: "Jobspresso",
  "the-hub": "The Hub",
  "agentic-jobs": "Agentic Engineering Jobs",
  "a16z-speedrun": "a16z Speedrun Talent",
  usajobs: "USAJOBS",
};

export const DEFAULT_ENABLED_BOARDS: BoardSource[] = [
  "remote-ok",
  "remotive",
  "himalayas",
  "arbeitnow",
  "we-work-remotely",
  "jobicy",
  "working-nomads",
  "the-muse",
  "hn-who-is-hiring",
  "landing-jobs",
  "nodesk",
  "get-on-board",
  "jobspresso",
  "the-hub",
  "agentic-jobs",
  "a16z-speedrun",
];

export function mergeEnabledBoards(saved: string[]): BoardSource[] {
  const allowed = new Set<string>(BOARD_SOURCES);
  const enabled = new Set(saved.filter((id): id is BoardSource => allowed.has(id)));
  if (!enabled.size) {
    for (const id of DEFAULT_ENABLED_BOARDS) enabled.add(id);
  } else {
    const legacy = new Set<string>(LEGACY_BOARD_SOURCES);
    for (const id of DEFAULT_ENABLED_BOARDS) {
      if (!legacy.has(id)) enabled.add(id);
    }
  }
  return BOARD_SOURCES.filter((id) => enabled.has(id));
}

/** Bump when adding default-on boards so existing Mongo settings pick them up once. */
export const ENABLED_BOARDS_VERSION = 3;

export function resolveEnabledBoards(saved: string[], version = 0): BoardSource[] {
  if (version < ENABLED_BOARDS_VERSION) return mergeEnabledBoards(saved);
  const allowed = new Set<string>(BOARD_SOURCES);
  const enabled = saved.filter((id): id is BoardSource => allowed.has(id));
  return enabled.length ? BOARD_SOURCES.filter((id) => enabled.includes(id)) : [...DEFAULT_ENABLED_BOARDS];
}

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
