import { CompanyWatchModel, JobListingModel } from "@/models";
import { canonicalKey, clipText, normalizeApplyUrl, titleCompanyLocationHash } from "@/lib/jobs/canonical";
import type { NormalizedJob } from "@/lib/jobs/normalize";
import { scoreListing } from "@/lib/jobs/score";
import type { StackTerm } from "@/lib/jobs/stack";
import { matchStack } from "@/lib/jobs/stack";
import type { AdapterError } from "@/types/job-search";

const LOCKED_STATUSES = new Set(["saved", "skipped", "drafted", "applied", "hidden"]);

export async function upsertJobs(
  jobs: NormalizedJob[],
  terms: StackTerm[],
): Promise<{
  added: number;
  updated: number;
  skippedRole: number;
  skippedInvalid: number;
}> {
  let added = 0;
  let updated = 0;
  let skippedRole = 0;
  let skippedInvalid = 0;

  for (const job of jobs) {
    const title = job.title.trim();
    const applyUrl = job.applyUrl ? normalizeApplyUrl(job.applyUrl) : "";
    if (!title || !applyUrl) {
      skippedInvalid += 1;
      continue;
    }

    const company = job.company.trim() || job.boardToken || job.source;
    const location = job.location.trim();
    const stackMatches = matchStack(`${title}\n${job.descriptionText}\n${location}`, terms);
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
      existing.remote = existing.remote || job.remote;
      if (job.postedAt) existing.postedAt = job.postedAt;
    }
    await existing.save();
    updated += 1;
  }

  return { added, updated, skippedRole, skippedInvalid };
}

export async function markWatchResult(id: string, error?: string) {
  await CompanyWatchModel.findByIdAndUpdate(id, {
    lastPolledAt: new Date(),
    lastError: error || "",
  });
}

export function pushAdapterError(errors: AdapterError[], adapter: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  errors.push({ adapter, error: message.slice(0, 400) });
}
