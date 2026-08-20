"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { enrichJobListings, runJobPoll, saveJobBoardSettings } from "@/app/admin/job-actions";
import { AdminButton } from "@/components/admin/admin-ui";
import { BOARD_LABELS, BOARD_SOURCES, type BoardSource } from "@/types/job-search";
import { cn } from "@/lib/cn";

function Spinner() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}

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
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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
      if (result.retrySeconds) setCooldown(result.retrySeconds);
      return;
    }
    setMessage(
      result.enriched
        ? `Scored ${result.enriched} listing${result.enriched === 1 ? "" : "s"} with AI.`
        : "Nothing left to score. Run Find jobs first.",
    );
    router.refresh();
  }

  function confirmScore() {
    if (busy !== "" || cooldown > 0 || !canEnrich) return;
    const ok = window.confirm("Score new listings with AI?\n\nThis uses your Gemini request budget (a few requests).");
    if (ok) void onScore();
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
          {busy === "find" ? <Spinner /> : null}
          {busy === "find" ? "Searching…" : "Find jobs"}
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={busy !== "" || !canEnrich || cooldown > 0}
          onClick={confirmScore}
          title={canEnrich ? undefined : "Add GEMINI_API_KEY to enable AI scoring"}
        >
          {busy === "score" ? <Spinner /> : null}
          {busy === "score" ? "Scoring…" : cooldown > 0 ? `Score with AI (${cooldown}s)` : "Score with AI"}
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
