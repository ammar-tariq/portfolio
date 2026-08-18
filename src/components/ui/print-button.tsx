"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="link-underline text-muted"
    >
      Print / Save as PDF
    </button>
  );
}
