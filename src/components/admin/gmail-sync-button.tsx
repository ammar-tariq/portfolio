"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { syncGmailReplies } from "@/app/admin/actions";
import { AdminButton } from "@/components/admin/admin-ui";

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
    <div className="rounded-xl border border-line bg-bg-elevated/40 p-5">
      <p className="text-sm font-medium">Gmail inbox</p>
      <p className="mt-1 text-sm text-muted">
        Replies stay in Gmail. This only pulls snippets for threads you sent from admin.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <AdminButton type="button" variant="secondary" onClick={() => void onSync()} disabled={busy}>
          {busy ? "Syncing…" : "Sync replies"}
        </AdminButton>
        {lastSyncAt ? (
          <p className="text-sm text-muted">Last sync {new Date(lastSyncAt).toLocaleString()}</p>
        ) : null}
      </div>
      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
