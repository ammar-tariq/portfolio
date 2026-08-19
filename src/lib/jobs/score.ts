import type { JobSource } from "@/types/job-search";
import { looksRemote } from "@/lib/jobs/role-filter";

const BOOST_TERMS: { re: RegExp; score: number; note: string }[] = [
  { re: /\bwork from anywhere\b/i, score: 18, note: "work from anywhere" },
  { re: /\bworldwide\b|\bglobal remote\b|\bremote worldwide\b/i, score: 16, note: "worldwide remote" },
  { re: /\bpakistan\b/i, score: 20, note: "Pakistan mentioned" },
  { re: /\bvisa sponsorship\b|\bsponsors? visas?\b|\bwill sponsor\b/i, score: 14, note: "visa sponsorship" },
  { re: /\brelocation\b|\brelocating\b/i, score: 10, note: "relocation" },
  { re: /\bblue card\b|\bhighly skilled migrant\b|\bskilled worker visa\b/i, score: 12, note: "EU/UK visa path" },
  { re: /\beor\b|\bemployer of record\b|\bcontractor\b|\bcontract\b/i, score: 8, note: "contractor/EOR" },
  { re: /\buae\b|\bdubai\b|\bsaudi\b|\bksa\b|\bgcc\b|\biqama\b/i, score: 10, note: "GCC" },
];

const PENALTY_TERMS: { re: RegExp; score: number; note: string }[] = [
  { re: /\bus citizen(?:ship)? (?:only|required)\b|\bmust be (?:a )?u\.?s\.? citizen\b/i, score: 22, note: "US citizenship required" },
  { re: /\bno visa sponsorship\b|\bnot (?:able|able to|going to) sponsor\b|\bsponsorship (?:is )?not available\b/i, score: 16, note: "no sponsorship" },
  { re: /\bmust be (?:located|based) in (?:the )?u\.?s\.?\b|\bus(?:a)? only\b|\bunited states only\b/i, score: 14, note: "US location only" },
  { re: /\bsecurity clearance\b|\bts\/sci\b/i, score: 12, note: "clearance" },
];

const SOURCE_BASE: Partial<Record<JobSource, number>> = {
  himalayas: 28,
  "remote-ok": 26,
  remotive: 26,
  jobicy: 26,
  "working-nomads": 25,
  "we-work-remotely": 24,
  "hn-who-is-hiring": 24,
  "the-muse": 22,
  "landing-jobs": 22,
  arbeitnow: 22,
  greenhouse: 12,
  lever: 12,
  ashby: 12,
  workable: 10,
  recruitee: 10,
  personio: 10,
  breezy: 8,
  smartrecruiters: 8,
  bamboohr: 6,
  usajobs: 4,
};

export type ScoreResult = {
  priorityScore: number;
  eligibilityNotes: string;
  visaLanguage: boolean;
  citizenshipRequirement: boolean;
};

export function scoreListing(input: {
  source: JobSource;
  title: string;
  location: string;
  descriptionText: string;
  remote: boolean;
  stackMatches?: string[];
}): ScoreResult {
  const hay = `${input.title}\n${input.location}\n${input.descriptionText}`;
  const notes: string[] = [];
  let score = SOURCE_BASE[input.source] ?? 8;
  const remote = input.remote || looksRemote(input.location, input.title, input.descriptionText);
  if (remote) {
    score += 8;
    notes.push("remote signal");
  }

  let visaLanguage = false;
  let citizenshipRequirement = false;

  for (const term of BOOST_TERMS) {
    if (term.re.test(hay)) {
      score += term.score;
      notes.push(term.note);
      if (/visa|sponsor|relocation|blue card|migrant|skilled worker|gcc|uae|saudi/i.test(term.note)) {
        visaLanguage = true;
      }
    }
  }
  for (const term of PENALTY_TERMS) {
    if (term.re.test(hay)) {
      score -= term.score;
      notes.push(term.note);
      citizenshipRequirement = true;
    }
  }

  const stackMatches = input.stackMatches ?? [];
  if (stackMatches.length) {
    score += Math.min(30, stackMatches.length * 8);
    notes.unshift(`stack: ${stackMatches.slice(0, 6).join(", ")}`);
  }

  return {
    priorityScore: Math.max(0, Math.min(100, score)),
    eligibilityNotes: notes.slice(0, 8).join("; "),
    visaLanguage,
    citizenshipRequirement,
  };
}
