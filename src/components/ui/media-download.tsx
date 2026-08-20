"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useAdminViewer } from "@/components/providers/admin-viewer";
import { cn } from "@/lib/cn";

export function downloadAdminMedia(src: string, name: string) {
  const url = `/api/admin/download?url=${encodeURIComponent(src)}&name=${encodeURIComponent(name)}`;
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export async function downloadAdminMediaAll(items: { src: string; name: string }[]) {
  for (const [index, item] of items.entries()) {
    downloadAdminMedia(item.src, item.name);
    if (index < items.length - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
    }
  }
}

export function MediaDownloadButton({
  src,
  name,
  className,
}: {
  src: string;
  name: string;
  className?: string;
}) {
  const isAdmin = useAdminViewer();
  const [busy, setBusy] = useState(false);
  if (!isAdmin || !src) return null;

  return (
    <button
      type="button"
      aria-label={`Download ${name}`}
      title="Download"
      disabled={busy}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        downloadAdminMedia(src, name);
        window.setTimeout(() => setBusy(false), 400);
      }}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-bg/85 text-fg shadow-sm backdrop-blur transition-colors hover:border-line-strong hover:bg-bg disabled:opacity-50",
        className,
      )}
    >
      <Download className="h-3.5 w-3.5" />
    </button>
  );
}

export function MediaDownloadAllButton({
  items,
  label = "Download all",
}: {
  items: { src: string; name: string }[];
  label?: string;
}) {
  const isAdmin = useAdminViewer();
  const [busy, setBusy] = useState(false);
  if (!isAdmin || items.length === 0) return null;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void downloadAdminMediaAll(items).finally(() => setBusy(false));
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-muted uppercase transition-colors hover:border-line-strong hover:text-fg disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" />
      {busy ? "Saving…" : label}
    </button>
  );
}
