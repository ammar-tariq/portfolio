import Link from "next/link";
import { connectDb } from "@/lib/db";
import { hasGemini, hasMongo, hasUsajobs } from "@/lib/env";
import { JobListingModel, JobPollStateModel } from "@/models";
import { listingFromDoc, pollStateFromDoc } from "@/lib/jobs/from-doc";
import { parseSharedJob } from "@/lib/job-posting";
import { JobsFinder } from "@/components/admin/jobs-finder";
import { ListingActions } from "@/components/admin/listing-actions";
import { ApplicationForm } from "@/components/admin/application-form";
import { AdminBadge, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { BOARD_LABELS, DEFAULT_ENABLED_BOARDS, type JobListing } from "@/types/job-search";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

function statusTone(status: string): "muted" | "accent" | "ok" | "warn" {
  if (status === "saved" || status === "drafted") return "warn";
  if (status === "applied") return "ok";
  if (status === "seen") return "accent";
  return "muted";
}

const tabs: { id: string; label: string; status: string }[] = [
  { id: "open", label: "To review", status: "open" },
  { id: "saved", label: "Saved", status: "saved" },
  { id: "skipped", label: "Skipped", status: "skipped" },
  { id: "drafted", label: "Drafted", status: "drafted" },
  { id: "applied", label: "Applied", status: "applied" },
  { id: "hidden", label: "Hidden", status: "hidden" },
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; title?: string; text?: string; url?: string }>;
}) {
  const params = await searchParams;
  if (!hasMongo()) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Jobs" description="MongoDB is required to store listings." />
      </div>
    );
  }

  await connectDb();
  const filter: Record<string, unknown> = {};
  const statusParam = params.status?.trim() || "open";
  if (statusParam === "open") {
    filter.status = "seen";
  } else if (["saved", "skipped", "drafted", "applied", "hidden"].includes(statusParam)) {
    filter.status = statusParam;
  }
  filter.stackMatches = { $exists: true, $ne: [] };
  const q = params.q?.trim();
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { company: { $regex: q, $options: "i" } },
    ];
  }

  const [docs, poll] = await Promise.all([
    JobListingModel.find(filter).sort({ priorityScore: -1, createdAt: -1 }).limit(80).lean(),
    JobPollStateModel.findById("jobs").lean(),
  ]);
  const items = docs.map(listingFromDoc);
  const state = pollStateFromDoc(poll);
  const enabledBoards = state.enabledBoards.length ? state.enabledBoards : [...DEFAULT_ENABLED_BOARDS];

  const query = q ? `&q=${encodeURIComponent(q)}` : "";
  const sharedInitial = parseSharedJob({ title: params.title, text: params.text, url: params.url });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Jobs"
        description="Find roles on public boards that match your skills, then prepare a resume. You apply on the company site."
      />

      <JobsFinder
        enabledBoards={enabledBoards}
        includeCompanyAts={state.includeCompanyAts}
        usajobsReady={hasUsajobs()}
        lastRunAt={state.lastRunAt}
        canEnrich={hasGemini()}
      />

      <AdminPanel className="p-5">
        <p className="text-sm font-medium">Add a job</p>
        <p className="mt-1 text-sm text-muted">
          For LinkedIn, Indeed, or any posting the boards miss. Paste a URL or the description, then generate a resume
          and letter.
        </p>
        <div className="mt-4">
          <ApplicationForm canGenerate={hasGemini()} initial={sharedInitial} compact />
        </div>
      </AdminPanel>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {tabs.map((tab) => {
            const active = statusParam === tab.status;
            return (
              <Link
                key={tab.id}
                href={`/admin/jobs?status=${tab.status}${query}`}
                className={cn(active ? "text-fg" : "text-muted hover:text-fg")}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <form method="get" className="flex gap-2">
          {statusParam !== "open" ? <input type="hidden" name="status" value={statusParam} /> : null}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search title or company"
            className="w-full rounded-lg border border-line bg-bg-elevated px-3 py-2 text-sm sm:w-64"
          />
        </form>
      </div>

      <AdminPanel>
        {items.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">
            {statusParam === "open"
              ? "Nothing to review. Tap Find jobs. Matches come from your Skills page."
              : "Nothing here."}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <ListingRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </AdminPanel>
      <p className="text-sm text-muted">
        Need a specific company careers page?{" "}
        <Link href="/admin/jobs/watchlist" className="text-fg underline-offset-2 hover:underline">
          Add it to the watchlist
        </Link>
        .
      </p>
    </div>
  );
}

function ListingRow({ item }: { item: JobListing }) {
  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link href={`/admin/jobs/${item.id}`} className="font-medium hover:text-accent">
          {item.title}
        </Link>
        <p className="mt-1 text-sm text-muted">
          {item.company}
          {item.location ? ` · ${item.location}` : ""}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-1.5">
          <AdminBadge tone={statusTone(item.status)}>
            {item.status === "seen" ? "new" : item.status === "drafted" ? "draft" : item.status}
          </AdminBadge>
          <AdminBadge>{BOARD_LABELS[item.source as keyof typeof BOARD_LABELS] ?? item.source}</AdminBadge>
          {item.stackMatches.slice(0, 4).map((skill) => (
            <AdminBadge key={skill} tone="accent">
              {skill}
            </AdminBadge>
          ))}
        </p>
      </div>
      <ListingActions listing={item} />
    </li>
  );
}
