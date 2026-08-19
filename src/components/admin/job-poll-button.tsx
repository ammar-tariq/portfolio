"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runJobPoll } from "@/app/admin/job-actions";
import { AdminButton } from "@/components/admin/admin-ui";

export function JobPollButton({
  lastRunAt,
  lastError,
  lastAdded,
  lastUpdated,
  lastSkippedRole,
  adapterErrors,
}: {
  lastRunAt?: string;
  lastError?: string;
  lastAdded?: number;
  lastUpdated?: number;
  lastSkippedRole?: number;
  adapterErrors?: { adapter: string; error: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function onPoll() {
    setBusy(true);
    setMessage("");
    const result = await runJobPoll();
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      `Added ${result.added}, updated ${result.updated}${
        result.skippedRole ? `, skipped ${result.skippedRole} off-stack` : ""
      }${result.errors ? `, ${result.errors} source errors` : ""}.`,
    );
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-line bg-bg-elevated/40 p-5">
      <p className="text-sm font-medium">Discovery poll</p>
      <p className="mt-1 text-sm text-muted">
        Pulls the job boards you enabled and keeps roles that match your site skills. Nothing is submitted.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <AdminButton type="button" variant="secondary" onClick={() => void onPoll()} disabled={busy}>
          {busy ? "Polling…" : "Poll now"}
        </AdminButton>
        {lastRunAt ? (
          <p className="text-sm text-muted">
            Last run {new Date(lastRunAt).toLocaleString()}
            {typeof lastAdded === "number" ? ` · +${lastAdded} / ~${lastUpdated}` : ""}
            {lastSkippedRole ? ` · ${lastSkippedRole} skipped` : ""}
          </p>
        ) : (
          <p className="text-sm text-muted">Not run yet. Local loop needs JOB_POLL_LOOP=1.</p>
        )}
      </div>
      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
      {lastError && !message ? <p className="mt-3 text-sm text-muted">{lastError}</p> : null}
      {adapterErrors?.length ? (
        <ul className="mt-3 space-y-1 text-xs text-muted">
          {adapterErrors.slice(0, 6).map((row) => (
            <li key={`${row.adapter}-${row.error}`}>
              {row.adapter}: {row.error}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
