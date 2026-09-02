"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-ui";

function filenameFromDisposition(header: string | null) {
  const match = /filename="([^"]+)"/.exec(header ?? "");
  return match?.[1] || "portfolio.json";
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function PortfolioJsonExport() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function onGenerate() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/portfolio-json", { credentials: "same-origin" });
      if (!response.ok) {
        setMessage(response.status === 401 ? "Sign in again, then retry." : "Could not generate the JSON.");
        return;
      }
      const text = await response.text();
      const filename = filenameFromDisposition(response.headers.get("Content-Disposition"));
      downloadText(text, filename);
      try {
        await navigator.clipboard.writeText(text);
        setMessage("Downloaded and copied. Paste it into an AI chat.");
      } catch {
        setMessage("Downloaded. Copy the file contents if you want to paste them.");
      }
    } catch {
      setMessage("Could not generate the JSON.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-bg-elevated/40 p-5">
      <p className="text-sm font-medium">Portfolio JSON</p>
      <p className="mt-1 text-sm text-muted">
        A facts-only snapshot of the live site — profile, experience, skills, case studies, open
        source, and architecture. Paste it into an AI chat for proposals, estimates, and similar
        writing.
      </p>
      <div className="mt-4">
        <AdminButton type="button" onClick={() => void onGenerate()} disabled={busy}>
          <Download className="h-4 w-4" />
          {busy ? "Generating…" : "Generate JSON of the portfolio"}
        </AdminButton>
      </div>
      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
