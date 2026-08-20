"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enrichJobListings, runJobPoll, saveJobBoardSettings } from "@/app/admin/job-actions";
import { AdminButton } from "@/components/admin/admin-ui";
import { BOARD_LABELS, BOARD_SOURCES, type BoardSource } from "@/types/job-search";
import { cn } from "@/lib/cn";

export function JobsFinder({
  enabledBoards,
  includeCompanyAts,
  usajobsReady,
  lastRunAt,
  canEnrich,
}: {
  enabledBoards: BoardSource[];
  includeCompanyAts: boolean;
  usajobsReady: boolean;
  lastRunAt?: string;
  canEnrich: boolean;
}) {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardSource[]>(enabledBoards);
  const [companyAts, setCompanyAts] = useState(includeCompanyAts);
  const [busy, setBusy] = useState<"" | "find" | "score">("");
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
    setBusy("find");
    setMessage("");
    const result = await runJobPoll();
    setBusy("");
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

  async function onScore() {
    setBusy("score");
    setMessage("");
    const result = await enrichJobListings();
    setBusy("");
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      result.enriched
        ? `Scored ${result.enriched} listing${result.enriched === 1 ? "" : "s"} with AI.`
        : "Nothing left to score. Run Find jobs first.",
    );
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-line bg-bg-elevated/40 p-5">
      <p className="text-sm text-muted">
        Turn on boards, then find jobs. Listings are matched against your Skills page. For LinkedIn or Indeed, use
        “Add a job” below.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {BOARD_SOURCES.map((id) => {
          const on = boards.includes(id);
          const disabled = id === "usajobs" && !usajobsReady;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled || busy !== ""}
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
        <AdminButton type="button" variant="primary" disabled={busy !== ""} onClick={() => void onFind()}>
          {busy === "find" ? "Searching…" : "Find jobs"}
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={busy !== "" || !canEnrich}
          onClick={() => void onScore()}
          title={canEnrich ? undefined : "Add GEMINI_API_KEY to enable AI scoring"}
        >
          {busy === "score" ? "Scoring…" : "Score with AI"}
        </AdminButton>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={companyAts}
            disabled={busy !== ""}
            onChange={(event) => {
              const next = event.target.checked;
              setCompanyAts(next);
              void saveJobBoardSettings({ enabledBoards: boards, includeCompanyAts: next });
            }}
          />
          Also search extra company boards
        </label>
        {lastRunAt ? <p className="text-sm text-muted">Updated {new Date(lastRunAt).toLocaleString()}</p> : null}
      </div>
      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
