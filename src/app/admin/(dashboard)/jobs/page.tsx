import { connectDb } from "@/lib/db";
import { hasMongo, hasUsajobs } from "@/lib/env";
import { JobListingModel, JobPollStateModel } from "@/models";
import { listingFromDoc, pollStateFromDoc } from "@/lib/jobs/from-doc";
import { JobPollButton } from "@/components/admin/job-poll-button";
import { ListingActions } from "@/components/admin/listing-actions";
import { AdminBadge, AdminLink, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { BOARD_SOURCES, LISTING_STATUSES, WATCH_ATS, type JobListing, type ListingStatus } from "@/types/job-search";

export const dynamic = "force-dynamic";

function statusTone(status: string): "muted" | "accent" | "ok" | "warn" {
  if (status === "saved" || status === "drafted") return "warn";
  if (status === "applied") return "ok";
  if (status === "seen") return "accent";
  return "muted";
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    source?: string;
    q?: string;
    remote?: string;
    minScore?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  if (!hasMongo()) {
    return (
      <div className="space-y-6">
        <AdminPageHeader eyebrow="Jobs" title="Job search" description="MongoDB is required to store listings." />
      </div>
    );
  }

  await connectDb();
  const filter: Record<string, unknown> = {};
  const statusParam = params.status?.trim() || "open";
  if (statusParam === "open") {
    filter.status = { $in: ["seen", "saved"] };
  } else if (LISTING_STATUSES.includes(statusParam as ListingStatus)) {
    filter.status = statusParam;
  }
  if (params.source?.trim()) filter.source = params.source.trim();
  if (params.remote === "1") filter.remote = true;
  const minScore = Number(params.minScore);
  if (Number.isFinite(minScore) && minScore > 0) filter.priorityScore = { $gte: minScore };
  const q = params.q?.trim();
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { company: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }

  const docs =
    params.sort === "date"
      ? await JobListingModel.find(filter).sort({ createdAt: -1 }).limit(80).lean()
      : await JobListingModel.find(filter).sort({ priorityScore: -1, createdAt: -1 }).limit(80).lean();
  const poll = await JobPollStateModel.findById("jobs").lean();
  const items = docs.map(listingFromDoc);
  const state = pollStateFromDoc(poll);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Jobs"
        title="Job search"
        description="Discover listings from public ATS feeds and remote boards. Rank for Pakistan / remote / relocation — never hide a role because it looks US-only. Prepare materials here, then apply on the company site."
        actions={
          <>
            <AdminLink href="/admin/jobs/watchlist">Watchlist</AdminLink>
            <AdminLink href="/admin/apply" variant="primary">
              Paste URL
            </AdminLink>
          </>
        }
      />

      <JobPollButton
        lastRunAt={state.lastRunAt}
        lastError={state.lastError}
        lastAdded={state.lastAdded}
        lastUpdated={state.lastUpdated}
        lastSkippedRole={state.lastSkippedRole}
        adapterErrors={state.adapterErrors}
      />

      {!hasUsajobs() ? (
        <p className="text-sm text-muted">USAJOBS adapter is off until USAJOBS_API_KEY and USAJOBS_USER_AGENT are set.</p>
      ) : null}

      <AdminPanel className="p-5">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" method="get">
          <label className="text-sm">
            <span className="font-mono text-[10px] tracking-wide text-subtle uppercase">Status</span>
            <select name="status" defaultValue={statusParam} className="mt-1 w-full rounded-lg border border-line bg-bg-elevated px-3 py-2 text-sm">
              <option value="open">Open (seen + saved)</option>
              {LISTING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-mono text-[10px] tracking-wide text-subtle uppercase">Source</span>
            <select name="source" defaultValue={params.source ?? ""} className="mt-1 w-full rounded-lg border border-line bg-bg-elevated px-3 py-2 text-sm">
              <option value="">All</option>
              {[...WATCH_ATS, ...BOARD_SOURCES].map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-mono text-[10px] tracking-wide text-subtle uppercase">Min score</span>
            <input
              name="minScore"
              defaultValue={params.minScore ?? ""}
              className="mt-1 w-full rounded-lg border border-line bg-bg-elevated px-3 py-2 text-sm"
              placeholder="0"
            />
          </label>
          <label className="text-sm">
            <span className="font-mono text-[10px] tracking-wide text-subtle uppercase">Search</span>
            <input
              name="q"
              defaultValue={q ?? ""}
              className="mt-1 w-full rounded-lg border border-line bg-bg-elevated px-3 py-2 text-sm"
              placeholder="Title or company"
            />
          </label>
          <label className="text-sm">
            <span className="font-mono text-[10px] tracking-wide text-subtle uppercase">Sort</span>
            <select name="sort" defaultValue={params.sort === "date" ? "date" : "score"} className="mt-1 w-full rounded-lg border border-line bg-bg-elevated px-3 py-2 text-sm">
              <option value="score">Score</option>
              <option value="date">Newest</option>
            </select>
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="remote" value="1" defaultChecked={params.remote === "1"} />
            Remote only
          </label>
          <div className="sm:col-span-2 lg:col-span-6">
            <button type="submit" className="rounded-lg border border-line px-3 py-2 text-sm">
              Filter
            </button>
          </div>
        </form>
      </AdminPanel>

      <AdminPanel>
        {items.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">
            No listings yet. Add a watchlist, then Poll now. LinkedIn and Indeed stay on Paste URL.
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <ListingRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}

function ListingRow({ item }: { item: JobListing }) {
  return (
    <li className="space-y-3 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">
            {item.title} · {item.company}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <AdminBadge tone={statusTone(item.status)}>{item.status}</AdminBadge>
            <AdminBadge>{item.source}</AdminBadge>
            <span>score {item.priorityScore}</span>
            {item.remote ? <AdminBadge tone="accent">remote</AdminBadge> : null}
            {item.visaLanguage ? <AdminBadge tone="ok">visa language</AdminBadge> : null}
            {item.citizenshipRequirement ? <AdminBadge tone="warn">citizenship</AdminBadge> : null}
            {item.location ? <span>{item.location}</span> : null}
          </p>
          {item.eligibilityNotes ? <p className="mt-1 text-xs text-subtle">{item.eligibilityNotes}</p> : null}
        </div>
      </div>
      <ListingActions listing={item} />
    </li>
  );
}
