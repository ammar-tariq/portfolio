"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { enrichJobListings, runJobPoll, saveJobBoardSettings } from "@/app/admin/job-actions";
import { AdminButton } from "@/components/admin/admin-ui";
import {
  BOARD_LABELS,
  BOARD_SOURCES,
  POSTED_WITHIN_OPTIONS,
  type BoardSource,
  type PostedWithinDays,
} from "@/types/job-search";
import { cn } from "@/lib/cn";

function Spinner() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}

const SUGGESTED_SKILLS = [
  "React Native",
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "NestJS",
  "Expo",
];

export function JobsFinder({
  enabledBoards,
  includeCompanyAts,
  postedWithinDays,
  requiredSkillGroups,
  skillSuggestions,
  usajobsReady,
  lastRunAt,
  canEnrich,
}: {
  enabledBoards: BoardSource[];
  includeCompanyAts: boolean;
  postedWithinDays: PostedWithinDays;
  requiredSkillGroups: string[][];
  skillSuggestions: string[];
  usajobsReady: boolean;
  lastRunAt?: string;
  canEnrich: boolean;
}) {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardSource[]>(enabledBoards);
  const [companyAts, setCompanyAts] = useState(includeCompanyAts);
  const [posted, setPosted] = useState<PostedWithinDays>(postedWithinDays);
  const [groups, setGroups] = useState<string[][]>(
    requiredSkillGroups.length ? requiredSkillGroups : [["React Native", "React"]],
  );
  const [draftSkill, setDraftSkill] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<"" | "find" | "score" | "save">("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const suggestions = [...new Set([...SUGGESTED_SKILLS, ...skillSuggestions])].slice(0, 16);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function persist(next: {
    boards?: BoardSource[];
    companyAts?: boolean;
    posted?: PostedWithinDays;
    groups?: string[][];
  }) {
    const enabledBoardsNext = next.boards ?? boards;
    const groupsNext = next.groups ?? groups;
    if (!enabledBoardsNext.length) {
      setMessage("Pick at least one source.");
      return false;
    }
    if (!groupsNext.some((group) => group.length)) {
      setMessage("Add at least one must-have skill.");
      return false;
    }
    setBusy("save");
    const result = await saveJobBoardSettings({
      enabledBoards: enabledBoardsNext,
      includeCompanyAts: next.companyAts ?? companyAts,
      postedWithinDays: next.posted ?? posted,
      requiredSkillGroups: groupsNext,
    });
    setBusy("");
    if (!result.ok) {
      setMessage(result.error);
      return false;
    }
    setMessage("");
    return true;
  }

  async function toggleBoard(id: BoardSource) {
    const next = boards.includes(id) ? boards.filter((item) => item !== id) : [...boards, id];
    if (!next.length) {
      setMessage("Pick at least one source.");
      return;
    }
    setBoards(next);
    await persist({ boards: next });
  }

  function toggleSkill(groupIndex: number, skill: string) {
    setGroups((prev) => {
      const next = prev.map((group, index) => {
        if (index !== groupIndex) return group;
        return group.includes(skill) ? group.filter((item) => item !== skill) : [...group, skill];
      });
      void persist({ groups: next });
      return next;
    });
  }

  function addSkillFromDraft(groupIndex: number) {
    const value = (draftSkill[groupIndex] ?? "").trim();
    if (!value) return;
    setDraftSkill((prev) => ({ ...prev, [groupIndex]: "" }));
    setGroups((prev) => {
      const next = prev.map((group, index) => {
        if (index !== groupIndex) return group;
        if (group.includes(value)) return group;
        return [...group, value];
      });
      void persist({ groups: next });
      return next;
    });
  }

  function addGroup() {
    setGroups((prev) => {
      const next = [...prev, []];
      void persist({ groups: next });
      return next;
    });
  }

  function removeGroup(groupIndex: number) {
    setGroups((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, index) => index !== groupIndex);
      void persist({ groups: next });
      return next;
    });
  }

  async function onFind() {
    const ok = await persist({});
    if (!ok) return;
    setBusy("find");
    setMessage("");
    const result = await runJobPoll();
    setBusy("");
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    const parts = [
      result.added ? `${result.added} new` : null,
      result.skippedRole ? `${result.skippedRole} skipped (skills)` : null,
      result.skippedStale ? `${result.skippedStale} skipped (too old)` : null,
    ].filter(Boolean);
    setMessage(
      result.added
        ? `Found ${result.added} new role${result.added === 1 ? "" : "s"}${parts.length > 1 ? ` · ${parts.slice(1).join(" · ")}` : ""}.`
        : parts.length
          ? `Caught up. ${parts.join(" · ")}.`
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
    <div className="grid gap-5 rounded-xl border border-line bg-bg-elevated/40 p-5">
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">1 · Sources</p>
        <p className="mt-1 text-sm text-muted">One board or several — Find only hits what you select.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {BOARD_SOURCES.map((id) => {
            const on = boards.includes(id);
            const disabled = id === "usajobs" && !usajobsReady;
            return (
              <button
                key={id}
                type="button"
                disabled={disabled || busy !== ""}
                onClick={() => void toggleBoard(id)}
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
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={companyAts}
            disabled={busy !== ""}
            onChange={(event) => {
              const next = event.target.checked;
              setCompanyAts(next);
              void persist({ companyAts: next });
            }}
          />
          Also search company watchlist
        </label>
      </div>

      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">2 · Posted</p>
        <p className="mt-1 text-sm text-muted">Skip older postings when the board provides a date.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {POSTED_WITHIN_OPTIONS.map((option) => {
            const on = posted === option.days;
            return (
              <button
                key={option.days}
                type="button"
                disabled={busy !== ""}
                onClick={() => {
                  setPosted(option.days);
                  void persist({ posted: option.days });
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-40",
                  on ? "border-accent/40 bg-accent/10 text-fg" : "border-line text-muted hover:text-fg",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">3 · Must-have skills</p>
        <p className="mt-1 text-sm text-muted">
          OR within a row, AND across rows. Example: React Native <em>or</em> React is required.
        </p>
        <div className="mt-3 grid gap-4">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="rounded-2xl border border-line bg-bg/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-subtle">
                  Group {groupIndex + 1}
                  {groups.length > 1 ? " · must match at least one" : ""}
                </p>
                {groups.length > 1 ? (
                  <button
                    type="button"
                    className="text-muted hover:text-fg"
                    disabled={busy !== ""}
                    onClick={() => removeGroup(groupIndex)}
                    aria-label="Remove group"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    disabled={busy !== ""}
                    onClick={() => toggleSkill(groupIndex, skill)}
                    className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm text-fg"
                  >
                    {skill}
                    <X className="h-3 w-3 opacity-70" />
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions
                  .filter((skill) => !group.includes(skill))
                  .slice(0, 8)
                  .map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      disabled={busy !== ""}
                      onClick={() => toggleSkill(groupIndex, skill)}
                      className="rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:text-fg"
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={draftSkill[groupIndex] ?? ""}
                  onChange={(event) => setDraftSkill((prev) => ({ ...prev, [groupIndex]: event.target.value }))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addSkillFromDraft(groupIndex);
                    }
                  }}
                  placeholder="Add skill…"
                  className="min-w-0 flex-1 rounded-lg border border-line bg-bg-elevated px-3 py-2 text-sm"
                  disabled={busy !== ""}
                />
                <AdminButton type="button" variant="secondary" disabled={busy !== ""} onClick={() => addSkillFromDraft(groupIndex)}>
                  Add
                </AdminButton>
              </div>
              {groupIndex < groups.length - 1 ? (
                <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-subtle uppercase">And</p>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            disabled={busy !== "" || groups.length >= 4}
            onClick={addGroup}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-fg disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add another must-have group (AND)
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
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
        {lastRunAt ? <p className="text-sm text-muted">Updated {new Date(lastRunAt).toLocaleString()}</p> : null}
      </div>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
