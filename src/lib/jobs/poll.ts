import { CompanyWatchModel, JobListingModel, JobPollStateModel } from "@/models";
import { connectDb } from "@/lib/db";
import { hasGemini, hasMongo, hasUsajobs } from "@/lib/env";
import { generateGeminiJson } from "@/lib/draft-project";
import { fetchWatchJobs } from "@/lib/jobs/adapters/ats";
import {
  fetchArbeitnowJobs,
  fetchHimalayasJobs,
  fetchRemoteOkJobs,
  fetchRemotiveJobs,
  fetchUsaJobs,
  fetchWeWorkRemotelyJobs,
} from "@/lib/jobs/adapters/boards";
import { sleep } from "@/lib/jobs/http";
import { pushAdapterError, upsertJobs } from "@/lib/jobs/upsert";
import { watchFromDoc } from "@/lib/jobs/from-doc";
import type { AdapterError, BoardSource, JobPollResult, WatchAts } from "@/types/job-search";
import { BOARD_SOURCES, DEFAULT_ENABLED_BOARDS } from "@/types/job-search";
import { getSiteContentForParams } from "@/lib/content";
import { stackTermsFromContent, type StackTerm } from "@/lib/jobs/stack";
import type { NormalizedJob } from "@/lib/jobs/normalize";

function normalizeEnabledBoards(value: unknown): BoardSource[] {
  const allowed = new Set<string>(BOARD_SOURCES);
  const list = Array.isArray(value) ? value.map(String) : [];
  const enabled = list.filter((id): id is BoardSource => allowed.has(id));
  return enabled.length ? enabled : [...DEFAULT_ENABLED_BOARDS];
}

const DELAY_MS = 250;
const MAX_JOBS_PER_ADAPTER = 180;
const WATCHES_PER_RUN = 8;

async function ingest(jobs: NormalizedJob[], terms: StackTerm[]) {
  return upsertJobs(jobs.slice(0, MAX_JOBS_PER_ADAPTER), terms);
}

async function loadStackTerms() {
  const content = await getSiteContentForParams();
  return stackTermsFromContent(content);
}

export async function pollWatchById(
  id: string,
): Promise<{ ok: true; added: number; updated: number; skippedRole: number } | { ok: false; error: string }> {
  if (!hasMongo()) return { ok: false, error: "MongoDB is not configured." };
  await connectDb();
  const watch = await CompanyWatchModel.findById(id);
  if (!watch) return { ok: false, error: "Watchlist board not found." };
  try {
    const terms = await loadStackTerms();
    const jobs = await fetchWatchJobs(watch.ats as WatchAts, String(watch.token), String(watch.name));
    const result = await ingest(jobs, terms);
    watch.lastPolledAt = new Date();
    watch.lastError = "";
    await watch.save();
    return { ok: true, added: result.added, updated: result.updated, skippedRole: result.skippedRole };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Poll failed.";
    watch.lastPolledAt = new Date();
    watch.lastError = message.slice(0, 400);
    await watch.save();
    return { ok: false, error: message };
  }
}

async function collect(adapter: string, errors: AdapterError[], run: () => Promise<NormalizedJob[]>) {
  try {
    return await run();
  } catch (error) {
    pushAdapterError(errors, adapter, error);
    return [];
  }
}

async function enrichNewListings(limit = 8) {
  if (!hasGemini()) return;
  const docs = await JobListingModel.find({
    status: "seen",
    eligibilityNotes: { $not: /gemini/i },
    descriptionText: { $exists: true, $ne: "" },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();

  for (const doc of docs) {
    try {
      const result = await generateGeminiJson(
        `You score a job listing for an applicant based in Pakistan who will take remote work or relocate.
Prefer roles that match this tech stack: ${
          Array.isArray(doc.stackMatches) ? doc.stackMatches.slice(0, 12).join(", ") : "see JD"
        }.
Never exclude a job only for location. Return JSON:
{"priorityDelta": number between -15 and 15, "visaLanguage": boolean, "citizenshipRequirement": boolean, "notes": "one short sentence about stack fit and eligibility"}
Title: ${String(doc.title)}
Company: ${String(doc.company)}
Location: ${String(doc.location)}
JD: ${String(doc.descriptionText).slice(0, 6000)}`,
      );
      const delta = Math.max(-15, Math.min(15, Number(result.priorityDelta) || 0));
      doc.priorityScore = Math.max(0, Math.min(100, Number(doc.priorityScore || 0) + delta));
      if (typeof result.visaLanguage === "boolean") doc.visaLanguage = result.visaLanguage;
      if (typeof result.citizenshipRequirement === "boolean") {
        doc.citizenshipRequirement = result.citizenshipRequirement;
      }
      const notes = String(result.notes ?? "").trim().slice(0, 240);
      const existing = String(doc.eligibilityNotes ?? "");
      doc.eligibilityNotes = [existing, notes ? `gemini: ${notes}` : "gemini: scored"].filter(Boolean).join("; ").slice(0, 400);
      await doc.save();
    } catch {
      /* keep keyword score */
    }
    await sleep(200);
  }
}

export async function pollJobSources(): Promise<JobPollResult | { ok: false; error: string }> {
  if (!hasMongo()) return { ok: false, error: "MongoDB is not configured." };
  await connectDb();

  const terms = await loadStackTerms();
  const errors: AdapterError[] = [];
  let added = 0;
  let updated = 0;
  let skippedRole = 0;

  const saved = await JobPollStateModel.findById("jobs").lean();
  const enabled = normalizeEnabledBoards((saved as { enabledBoards?: unknown } | null)?.enabledBoards);
  const includeCompanyAts = Boolean((saved as { includeCompanyAts?: boolean } | null)?.includeCompanyAts);

  const boardRuns: { name: BoardSource; run: () => Promise<NormalizedJob[]> }[] = [
    { name: "remote-ok", run: fetchRemoteOkJobs },
    { name: "remotive", run: fetchRemotiveJobs },
    { name: "himalayas", run: fetchHimalayasJobs },
    { name: "arbeitnow", run: fetchArbeitnowJobs },
    { name: "we-work-remotely", run: fetchWeWorkRemotelyJobs },
  ];
  if (hasUsajobs()) boardRuns.push({ name: "usajobs", run: fetchUsaJobs });

  for (const board of boardRuns) {
    if (!enabled.includes(board.name)) continue;
    const result = await ingest(jobs, terms);
    added += result.added;
    updated += result.updated;
    skippedRole += result.skippedRole;
    await sleep(DELAY_MS);
  }

  let nextIndex = Number((saved as { lastWatchIndex?: number } | null)?.lastWatchIndex) || 0;
  if (includeCompanyAts) {
    const watches = (await CompanyWatchModel.find({ enabled: true }).sort({ name: 1 }).lean()).map(watchFromDoc);
    const start = nextIndex;
    const batch =
      watches.length <= WATCHES_PER_RUN
        ? watches
        : Array.from({ length: Math.min(WATCHES_PER_RUN, watches.length) }, (_, i) => watches[(start + i) % watches.length]);
    nextIndex = watches.length ? (start + batch.length) % watches.length : 0;

    for (const watch of batch) {
      if (!watch) continue;
      try {
        const jobs = await fetchWatchJobs(watch.ats as WatchAts, watch.token, watch.name);
        const result = await ingest(jobs, terms);
        added += result.added;
        updated += result.updated;
        skippedRole += result.skippedRole;
        await CompanyWatchModel.findByIdAndUpdate(watch.id, { lastPolledAt: new Date(), lastError: "" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Poll failed.";
        pushAdapterError(errors, `${watch.ats}:${watch.token}`, message);
        await CompanyWatchModel.findByIdAndUpdate(watch.id, {
          lastPolledAt: new Date(),
          lastError: message.slice(0, 400),
        });
      }
      await sleep(DELAY_MS);
    }
  }

  await enrichNewListings();

  await JobPollStateModel.findByIdAndUpdate(
    "jobs",
    {
      lastRunAt: new Date(),
      lastError: errors[0]?.error || "",
      adapterErrors: errors.slice(0, 40),
      lastAdded: added,
      lastUpdated: updated,
      lastSkippedRole: skippedRole,
      lastWatchIndex: nextIndex,
    },
    { upsert: true },
  );

  return { ok: true, added, updated, skippedRole, adapterErrors: errors };
}
