"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { connectDb } from "@/lib/db";
import { CompanyWatchModel, JobApplicationModel, JobListingModel, JobPollStateModel } from "@/models";
import { pollJobSources } from "@/lib/jobs/poll";
import { SUGGESTED_WATCHLIST } from "@/lib/jobs/seed-watchlist";
import { parseWatchInput } from "@/lib/jobs/watch-input";
import { formatGeminiError, parseRetrySeconds } from "@/lib/gemini-error";
import {
  BOARD_SOURCES,
  ENABLED_BOARDS_VERSION,
  LISTING_STATUSES,
  WATCH_ATS,
  type BoardSource,
  type ListingStatus,
  type WatchAts,
} from "@/types/job-search";

async function ready() {
  await requireAdmin();
  await connectDb();
}

function revalidateJobs(id?: string) {
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/jobs/watchlist");
  if (id) revalidatePath(`/admin/jobs/${id}`);
}

export async function runJobPoll(): Promise<
  | { ok: true; added: number; updated: number; skippedRole: number; errors: number }
  | { ok: false; error: string }
> {
  await ready();
  const result = await pollJobSources({ enrich: false });
  revalidateJobs();
  if (!result.ok) return result;
  return {
    ok: true,
    added: result.added,
    updated: result.updated,
    skippedRole: result.skippedRole,
    errors: result.adapterErrors.length,
  };
}

export async function enrichJobListings(): Promise<
  | { ok: true; enriched: number }
  | { ok: false; error: string; retrySeconds?: number }
> {
  await ready();
  const { enrichJobListings: run } = await import("@/lib/jobs/poll");
  try {
    const enriched = await run();
    revalidateJobs();
    return { ok: true, enriched };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scoring failed.";
    const retrySeconds = parseRetrySeconds(message) ?? undefined;
    return { ok: false, error: formatGeminiError(message), retrySeconds };
  }
}

export async function saveJobBoardSettings(input: {
  enabledBoards: string[];
  includeCompanyAts: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await ready();
  const enabled = input.enabledBoards.filter((id): id is BoardSource =>
    (BOARD_SOURCES as readonly string[]).includes(id),
  );
  if (!enabled.length) return { ok: false, error: "Turn on at least one job board." };
  await JobPollStateModel.findByIdAndUpdate(
    "jobs",
    { enabledBoards: enabled, includeCompanyAts: Boolean(input.includeCompanyAts), enabledBoardsVersion: ENABLED_BOARDS_VERSION },
    { upsert: true },
  );
  revalidateJobs();
  return { ok: true };
}

export async function addCompanyWatch(input: {
  name: string;
  ats: string;
  token: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await ready();
  const parsed = parseWatchInput(input.token);
  const ats = (parsed.ats ?? input.ats.trim().toLowerCase()) as WatchAts;
  const token = parsed.token;
  if (!WATCH_ATS.includes(ats)) return { ok: false, error: "Pick a supported ATS." };
  if (!token) return { ok: false, error: "Board token or slug is required." };
  const name = input.name.trim() || token;
  try {
    await CompanyWatchModel.create({ name, ats, token, enabled: true });
  } catch (error) {
    const message = String(error);
    if (message.includes("duplicate") || message.includes("E11000")) {
      return { ok: false, error: "That board is already on the watchlist." };
    }
    return { ok: false, error: error instanceof Error ? error.message : "Could not save." };
  }
  revalidateJobs();
  return { ok: true };
}

export async function seedSuggestedWatchlist(): Promise<{ ok: true; added: number } | { ok: false; error: string }> {
  await ready();
  let added = 0;
  for (const row of SUGGESTED_WATCHLIST) {
    const exists = await CompanyWatchModel.findOne({ ats: row.ats, token: row.token });
    if (exists) continue;
    await CompanyWatchModel.create({ ...row, enabled: true });
    added += 1;
  }
  revalidateJobs();
  return { ok: true, added };
}

export async function pollCompanyWatch(id: string): Promise<
  | { ok: true; added: number; updated: number; skippedRole: number }
  | { ok: false; error: string }
> {
  await ready();
  const { pollWatchById } = await import("@/lib/jobs/poll");
  const result = await pollWatchById(id);
  revalidateJobs();
  return result;
}

export async function setCompanyWatchEnabled(id: string, enabled: boolean) {
  await ready();
  await CompanyWatchModel.findByIdAndUpdate(id, { enabled });
  revalidateJobs();
}

export async function deleteCompanyWatch(id: string) {
  await ready();
  await CompanyWatchModel.findByIdAndDelete(id);
  revalidateJobs();
}

export async function setListingStatus(id: string, status: ListingStatus) {
  await ready();
  if (!LISTING_STATUSES.includes(status)) return;
  await JobListingModel.findByIdAndUpdate(id, { status });
  revalidateJobs(id);
}

export async function deleteListing(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await ready();
  const listing = await JobListingModel.findById(id).lean();
  if (!listing) return { ok: false, error: "Listing not found." };
  if (listing.applicationId) {
    return { ok: false, error: "This listing has an application. Delete the application first." };
  }
  await JobListingModel.findByIdAndDelete(id);
  revalidateJobs(id);
  return { ok: true };
}

export async function prepareListingApplication(id: string): Promise<{ ok: false; error: string } | void> {
  await ready();
  const listing = await JobListingModel.findById(id);
  if (!listing) return { ok: false, error: "Listing not found." };
  if (listing.applicationId) {
    redirect(`/admin/applications/${listing.applicationId}`);
  }
  const created = await JobApplicationModel.create({
    company: String(listing.company || "Company"),
    role: String(listing.title || "Role"),
    jobUrl: String(listing.applyUrl || ""),
    location: String(listing.location || "") || undefined,
    jd: String(listing.descriptionText || ""),
    aboutCompany: "",
    extraQuestions: "",
    status: "draft",
  });
  const applicationId = String(created._id);
  listing.applicationId = applicationId;
  listing.status = "drafted";
  await listing.save();
  revalidateJobs(id);
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  redirect(`/admin/applications/${applicationId}`);
}
