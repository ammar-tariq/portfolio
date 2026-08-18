"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { syncGmailReplies } from "@/app/admin/actions";

export function GmailSyncButton({
  lastSyncAt,
  lastError,
}: {
  lastSyncAt?: string;
  lastError?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(lastError ?? "");

  async function onSync() {
    setBusy(true);
    setMessage("");
    const result = await syncGmailReplies();
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      result.added
        ? `Synced ${result.added} new ${result.added === 1 ? "reply" : "replies"}.`
        : "Inbox checked. No new replies on tracked threads.",
    );
    router.refresh();
  }

  return (
    <div className="mt-6 rounded-3xl border border-line bg-bg-elevated/40 p-5">
      <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Gmail inbox</p>
      <p className="mt-2 text-sm text-muted">
        Replies stay in Gmail. The app only pulls snippets for threads you sent from admin. Push (Pub/Sub) plus a
        15-minute loop. Token needs gmail.readonly.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onSync()}
          disabled={busy}
          className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm disabled:opacity-50"
        >
          {busy ? "Syncing…" : "Sync replies now"}
        </button>
        {lastSyncAt ? (
          <p className="text-sm text-muted">Last sync {new Date(lastSyncAt).toLocaleString()}</p>
        ) : null}
      </div>
      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
