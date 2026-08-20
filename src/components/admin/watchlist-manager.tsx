"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addCompanyWatch,
  deleteCompanyWatch,
  pollCompanyWatch,
  seedSuggestedWatchlist,
  setCompanyWatchEnabled,
} from "@/app/admin/job-actions";
import { AdminButton, AdminBadge } from "@/components/admin/admin-ui";
import { Field, TextInput } from "@/components/admin/fields";
import { parseWatchInput } from "@/lib/jobs/watch-input";
import { WATCH_ATS, type CompanyWatch } from "@/types/job-search";

export function WatchlistManager({ items }: { items: CompanyWatch[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ats, setAts] = useState<(typeof WATCH_ATS)[number]>("greenhouse");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);

  async function onAdd() {
    setBusy(true);
    setMessage("");
    const result = await addCompanyWatch({ name, ats, token });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setName("");
    setToken("");
    router.refresh();
  }

  async function onSeed() {
    setBusy(true);
    setMessage("");
    const result = await seedSuggestedWatchlist();
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(result.added ? `Added ${result.added} suggested boards.` : "Suggested boards were already present.");
    router.refresh();
  }

  async function onPoll(item: CompanyWatch) {
    setPollingId(item.id);
    setMessage("");
    const result = await pollCompanyWatch(item.id);
    setPollingId(null);
    if (!result.ok) {
      setMessage(`${item.name}: ${result.error}`);
      return;
    }
    setMessage(
      result.added
        ? `${item.name}: ${result.added} new role${result.added === 1 ? "" : "s"}.`
        : `${item.name}: caught up, no new roles.`,
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Company">
          <TextInput value={name} onChange={(event) => setName(event.target.value)} placeholder="Figma" />
        </Field>
        <Field label="ATS">
          <select
            className="w-full rounded-lg border border-line bg-bg-elevated px-3 py-2.5 text-sm"
            value={ats}
            onChange={(event) => setAts(event.target.value as (typeof WATCH_ATS)[number])}
          >
            {WATCH_ATS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Board token or careers URL">
          <TextInput
            value={token}
            onChange={(event) => {
              const value = event.target.value;
              setToken(value);
              const parsed = parseWatchInput(value);
              if (parsed.ats) setAts(parsed.ats);
            }}
            placeholder="figma or https://boards.greenhouse.io/figma"
          />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <AdminButton type="button" variant="primary" disabled={busy || !token.trim()} onClick={() => void onAdd()}>
          Add
        </AdminButton>
        <button type="button" className="text-sm text-muted hover:text-fg" disabled={busy} onClick={() => void onSeed()}>
          Add suggested companies
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">
          Paste a Greenhouse / Lever / Ashby careers URL, or seed the suggested list, then poll each board with Poll
          now.
        </p>
      ) : null}
      {message ? <p className="text-sm text-muted">{message}</p> : null}

      <ul className="divide-y divide-line rounded-xl border border-line">
        {items.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted">No boards yet. Add a token or seed suggestions.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium">
                  {item.name}{" "}
                  <span className="font-mono text-xs text-muted">
                    {item.ats}/{item.token}
                  </span>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                  <AdminBadge tone={item.enabled ? "ok" : "muted"}>{item.enabled ? "on" : "off"}</AdminBadge>
                  {item.lastPolledAt ? <span>polled {new Date(item.lastPolledAt).toLocaleString()}</span> : <span>never polled</span>}
                  {item.lastError ? <span className="text-amber-300">{item.lastError}</span> : null}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AdminButton
                  type="button"
                  variant="secondary"
                  disabled={pollingId === item.id}
                  onClick={() => void onPoll(item)}
                >
                  {pollingId === item.id ? "Polling…" : "Poll now"}
                </AdminButton>
                <button
                  type="button"
                  className="text-muted hover:text-fg"
                  onClick={() => void setCompanyWatchEnabled(item.id, !item.enabled).then(() => router.refresh())}
                >
                  {item.enabled ? "Turn off" : "Turn on"}
                </button>
                <button
                  type="button"
                  className="text-muted hover:text-fg"
                  onClick={() => void deleteCompanyWatch(item.id).then(() => router.refresh())}
                >
                  Remove
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
