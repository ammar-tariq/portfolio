"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runJobPoll, saveJobBoardSettings } from "@/app/admin/job-actions";
import { AdminButton } from "@/components/admin/admin-ui";
import { BOARD_LABELS, BOARD_SOURCES, type BoardSource } from "@/types/job-search";
import { cn } from "@/lib/cn";

export function JobsFinder({
  enabledBoards,
  includeCompanyAts,
  usajobsReady,
  lastRunAt,
}: {
  enabledBoards: BoardSource[];
  includeCompanyAts: boolean;
  usajobsReady: boolean;
  lastRunAt?: string;
}) {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardSource[]>(enabledBoards);
  const [companyAts, setCompanyAts] = useState(includeCompanyAts);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function toggle(id: BoardSource) {
    const next = boards.includes(id) ? boards.filter((item) => item !== id) : [...boards, id];
    if (!next.length) {
      setMessage("Leave at least one board on.");
      return;
    }
    setBoards(next);
    const result = await saveJobBoardSettings({ enabledBoards: next, includeCompanyAts: companyAts });
    if (!result.ok) setMessage(result.error);
    else setMessage("");
  }

  async function onFind() {
    setBusy(true);
    setMessage("");
    const result = await runJobPoll();
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      result.added
        ? `Found ${result.added} new role${result.added === 1 ? "" : "s"} that match your skills.`
        : "Caught up. No new matching roles.",
    );
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-line bg-bg-elevated/40 p-5">
      <p className="text-sm text-muted">
        Turn on boards, then find jobs. Matches your Skills page. LinkedIn and Indeed still need Paste a job URL.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {BOARD_SOURCES.map((id) => {
          const on = boards.includes(id);
          const disabled = id === "usajobs" && !usajobsReady;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled || busy}
              onClick={() => void toggle(id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-40",
                on ? "border-accent/40 bg-accent/10 text-fg" : "border-line text-muted hover:text-fg",
              )}
            >
              {BOARD_LABELS[id]}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <AdminButton type="button" variant="primary" disabled={busy} onClick={() => void onFind()}>
          {busy ? "Searching…" : "Find jobs"}
        </AdminButton>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={companyAts}
            disabled={busy}
            onChange={(event) => {
              const next = event.target.checked;
              setCompanyAts(next);
              void saveJobBoardSettings({ enabledBoards: boards, includeCompanyAts: next });
            }}
          />
          Also search extra company boards
        </label>
        {lastRunAt ? (
          <p className="text-sm text-muted">Updated {new Date(lastRunAt).toLocaleString()}</p>
        ) : null}
      </div>
      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
