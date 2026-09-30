"use client";

import { trackEvent } from "@/lib/analytics-events";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => {
        trackEvent("resume_download", { method: "print" });
        window.print();
      }}
      className="link-underline text-muted"
    >
      Print / Save as PDF
    </button>
  );
}
