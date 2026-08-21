import { JobListingModel } from "@/models";
import { canonicalKey, clipText, normalizeApplyUrl, titleCompanyLocationHash } from "@/lib/jobs/canonical";
import type { NormalizedJob } from "@/lib/jobs/normalize";
import { scoreListing } from "@/lib/jobs/score";
import type { StackTerm } from "@/lib/jobs/stack";
import { isPostedWithinDays, matchRequiredSkillGroups, matchStack } from "@/lib/jobs/stack";
import type { AdapterError } from "@/types/job-search";

const LOCKED_STATUSES = new Set(["saved", "skipped", "drafted", "applied", "hidden"]);

export type UpsertOptions = {
  /** Soft portfolio stack terms (scoring / badges). */
  terms: StackTerm[];
  /** Compulsory OR-groups; empty = fall back to any portfolio stack hit. */
  requiredSkillGroups?: string[][];
  /** 0 = any; otherwise skip when postedAt is older than N days. */
  postedWithinDays?: number;
};

export async function upsertJobs(
  jobs: NormalizedJob[],
  options: UpsertOptions | StackTerm[],
): Promise<{
  added: number;
  updated: number;
  skippedRole: number;
  skippedStale: number;
  skippedInvalid: number;
}> {
  const opts: UpsertOptions = Array.isArray(options) ? { terms: options } : options;
  const terms = opts.terms;
  const requiredGroups = (opts.requiredSkillGroups ?? []).filter((group) => group.length);
  const postedWithinDays = opts.postedWithinDays ?? 0;

  let added = 0;
  let updated = 0;
  let skippedRole = 0;
  let skippedStale = 0;
  let skippedInvalid = 0;

  for (const job of jobs) {
    const title = job.title.trim();
    const applyUrl = job.applyUrl ? normalizeApplyUrl(job.applyUrl) : "";
    if (!title || !applyUrl) {
      skippedInvalid += 1;
      continue;
    }

    if (!isPostedWithinDays(job.postedAt, postedWithinDays)) {
      skippedStale += 1;
      continue;
    }

    const company = job.company.trim() || job.boardToken || job.source;
    const location = job.location.trim();
    const hay = `${title}\n${job.descriptionText}\n${location}`;

    let requiredMatches: string[] = [];
    if (requiredGroups.length) {
      const required = matchRequiredSkillGroups(hay, requiredGroups);
      if (!required.ok) {
        skippedRole += 1;
        continue;
      }
      requiredMatches = required.matched;
    }

    const softMatches = matchStack(hay, terms);
    if (!requiredGroups.length && terms.length && !softMatches.length) {
      skippedRole += 1;
      continue;
    }

    const stackMatches = [...new Set([...requiredMatches, ...softMatches])].slice(0, 16);
    const hash = titleCompanyLocationHash(title, company, location);
    const key = canonicalKey({
      applyUrl,
      source: job.source,
      atsJobId: job.atsJobId,
      boardToken: job.boardToken,
      announcementNumber: job.announcementNumber,
      hash,
    });
    const scored = scoreListing({
      source: job.source,
      title,
      location,
      descriptionText: job.descriptionText,
      remote: job.remote,
      stackMatches,
    });

    const existing = await JobListingModel.findOne({
      $or: [{ canonicalKey: key }, { applyUrl }, { titleCompanyLocationHash: hash, company }],
    });

    if (!existing) {
      await JobListingModel.create({
        source: job.source,
        canonicalKey: key,
        applyUrl,
        sourceUrls: [...new Set([applyUrl, ...job.sourceUrls.map(normalizeApplyUrl)])],
        atsJobId: job.atsJobId,
        boardToken: job.boardToken,
        title,
        company,
        location,
        remote: job.remote || scored.eligibilityNotes.includes("remote"),
        descriptionText: clipText(job.descriptionText),
        postedAt: job.postedAt,
        titleCompanyLocationHash: hash,
        ...scored,
        stackMatches,
        requiredMatches,
        status: "seen",
      });
      added += 1;
      continue;
    }

    const urls = new Set([...(existing.sourceUrls ?? []), applyUrl, ...job.sourceUrls.map(normalizeApplyUrl)]);
    existing.sourceUrls = [...urls];
    if (!LOCKED_STATUSES.has(String(existing.status))) {
      if (job.descriptionText && job.descriptionText.length > String(existing.descriptionText ?? "").length) {
        existing.descriptionText = clipText(job.descriptionText);
      }
      existing.priorityScore = scored.priorityScore;
      existing.eligibilityNotes = scored.eligibilityNotes;
      existing.visaLanguage = scored.visaLanguage;
      existing.citizenshipRequirement = scored.citizenshipRequirement;
      existing.stackMatches = stackMatches;
      existing.requiredMatches = requiredMatches;
      existing.remote = existing.remote || job.remote;
      if (job.postedAt) existing.postedAt = job.postedAt;
    }
    await existing.save();
    updated += 1;
  }

  return { added, updated, skippedRole, skippedStale, skippedInvalid };
}

export function pushAdapterError(errors: AdapterError[], adapter: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  errors.push({ adapter, error: message.slice(0, 400) });
}
