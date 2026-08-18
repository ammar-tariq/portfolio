"use client";

import { useState } from "react";
import { inputClass } from "./fields";

export function MediaUpload({
  label,
  folder,
  value,
  kind = "image",
  onUploaded,
  onUrl,
}: {
  label: string;
  folder: string;
  value?: string;
  kind?: "image" | "video";
  onUploaded: (asset: { url: string; publicId: string }) => void;
  onUrl?: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    body.set("folder", folder);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    setBusy(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Upload failed");
      return;
    }
    const asset = (await response.json()) as { url: string; publicId: string };
    onUploaded(asset);
  }

  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">{label}</p>
      {value && kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-2 h-28 rounded-2xl border border-line object-cover" />
      ) : null}
      {value && kind === "video" && !/youtube|youtu\.be|vimeo/.test(value) ? (
        <video src={value} className="mt-2 h-28 rounded-2xl border border-line bg-bg-soft" muted />
      ) : null}
      <input
        type="url"
        value={value ?? ""}
        placeholder="https://…"
        onChange={(event) => onUrl?.(event.target.value)}
        className={`${inputClass} mt-2`}
      />
      <p className="mt-2 text-xs text-subtle">Or upload a file</p>
      <input
        type="file"
        accept={kind === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*"}
        onChange={onChange}
        className="mt-1 text-sm text-muted"
      />
      {busy ? <p className="mt-1 text-xs text-subtle">Uploading…</p> : null}
      {error ? <p className="mt-1 text-xs text-accent">{error}</p> : null}
    </div>
  );
}

export function ImageUpload(props: {
  label: string;
  folder: string;
  value?: string;
  onUploaded: (asset: { url: string; publicId: string }) => void;
  onUrl?: (url: string) => void;
}) {
  return <MediaUpload {...props} kind="image" />;
}
