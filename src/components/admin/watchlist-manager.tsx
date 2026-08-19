"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCompanyWatch, deleteCompanyWatch, pollCompanyWatch, seedSuggestedWatchlist, setCompanyWatchEnabled } from "@/app/admin/job-actions";
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
      <div className="flex flex-wrap gap-2">
        <AdminButton type="button" variant="primary" disabled={busy || !token.trim()} onClick={() => void onAdd()}>
          Add board
        </AdminButton>
        <AdminButton type="button" variant="secondary" disabled={busy} onClick={() => void onSeed()}>
          Seed suggested companies
        </AdminButton>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">
          Paste a Greenhouse / Lever / Ashby careers URL, or seed the suggested list, then poll from Job search.
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
              <div className="flex gap-2">
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    void pollCompanyWatch(item.id).then((result) => {
                      setMessage(
                        result.ok
                          ? `Polled ${item.name}: +${result.added} / ~${result.updated}`
                          : result.error,
                      );
                      router.refresh();
                    })
                  }
                >
                  Poll
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    void setCompanyWatchEnabled(item.id, !item.enabled).then(() => router.refresh())
                  }
                >
                  {item.enabled ? "Disable" : "Enable"}
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="danger"
                  onClick={() => void deleteCompanyWatch(item.id).then(() => router.refresh())}
                >
                  Remove
                </AdminButton>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
