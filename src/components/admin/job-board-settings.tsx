"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveJobBoardSettings } from "@/app/admin/job-actions";
import { AdminButton } from "@/components/admin/admin-ui";
import { BOARD_LABELS, BOARD_SOURCES, type BoardSource } from "@/types/job-search";

export function JobBoardSettings({
  enabledBoards,
  includeCompanyAts,
  usajobsReady,
}: {
  enabledBoards: BoardSource[];
  includeCompanyAts: boolean;
  usajobsReady: boolean;
}) {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardSource[]>(enabledBoards);
  const [companyAts, setCompanyAts] = useState(includeCompanyAts);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function toggle(id: BoardSource) {
    setBoards((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function onSave() {
    setBusy(true);
    setMessage("");
    const result = await saveJobBoardSettings({ enabledBoards: boards, includeCompanyAts: companyAts });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage("Board selection saved. Poll now to fetch those feeds.");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-line bg-bg-elevated/40 p-5">
      <p className="text-sm font-medium">Job boards</p>
      <p className="mt-1 text-sm text-muted">
        Discovery follows the boards you turn on. Poll keeps listings that match skills from Admin → Skills (plus technologies on experience and projects).
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {BOARD_SOURCES.map((id) => (
          <li key={id}>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={boards.includes(id)}
                disabled={id === "usajobs" && !usajobsReady}
                onChange={() => toggle(id)}
              />
              {BOARD_LABELS[id]}
              {id === "usajobs" && !usajobsReady ? (
                <span className="text-xs text-subtle">needs API key</span>
              ) : null}
            </label>
          </li>
        ))}
      </ul>
      <label className="mt-4 flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={companyAts} onChange={(event) => setCompanyAts(event.target.checked)} />
        Also poll optional company ATS tokens (Watchlist)
      </label>
      <div className="mt-4">
        <AdminButton type="button" variant="secondary" disabled={busy} onClick={() => void onSave()}>
          Save boards
        </AdminButton>
      </div>
      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
