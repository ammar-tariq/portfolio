"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteListing, prepareListingApplication, setListingStatus } from "@/app/admin/job-actions";
import { AdminButton, AdminLink } from "@/components/admin/admin-ui";
import type { JobListing } from "@/types/job-search";

export function ListingActions({
  listing,
  showOpen,
}: {
  listing: JobListing;
  showOpen?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const status = listing.status;

  async function prepare() {
    setError("");
    const result = await prepareListingApplication(listing.id);
    if (result && !result.ok) setError(result.error);
  }

  function setStatus(next: Parameters<typeof setListingStatus>[1]) {
    setError("");
    start(async () => {
      await setListingStatus(listing.id, next);
      router.refresh();
    });
  }

  function remove() {
    setError("");
    start(async () => {
      const result = await deleteListing(listing.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "drafted" || status === "applied" ? (
        listing.applicationId ? (
          <AdminLink href={`/admin/applications/${listing.applicationId}`}>
            {status === "applied" ? "View application" : "Continue application"}
          </AdminLink>
        ) : null
      ) : (
        <AdminButton type="button" variant="primary" disabled={pending} onClick={() => void prepare()}>
          Prepare
        </AdminButton>
      )}

      {status === "seen" ? (
        <button type="button" disabled={pending} className="text-sm text-muted hover:text-fg disabled:opacity-50" onClick={() => setStatus("saved")}>
          Save
        </button>
      ) : null}

      {status === "saved" ? (
        <button type="button" disabled={pending} className="text-sm text-muted hover:text-fg disabled:opacity-50" onClick={() => setStatus("seen")}>
          Move to review
        </button>
      ) : null}

      {status === "skipped" ? (
        <button type="button" disabled={pending} className="text-sm text-muted hover:text-fg disabled:opacity-50" onClick={() => setStatus("seen")}>
          Restore
        </button>
      ) : null}

      {status === "hidden" ? (
        <button type="button" disabled={pending} className="text-sm text-muted hover:text-fg disabled:opacity-50" onClick={() => setStatus("seen")}>
          Unhide
        </button>
      ) : null}

      {showOpen && listing.applyUrl ? (
        <a href={listing.applyUrl} target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-fg">
          Open posting
        </a>
      ) : null}

      {status !== "skipped" && status !== "drafted" && status !== "applied" ? (
        <button type="button" disabled={pending} className="text-sm text-muted hover:text-fg disabled:opacity-50" onClick={() => setStatus("skipped")}>
          Skip
        </button>
      ) : null}

      {status !== "hidden" && status !== "drafted" && status !== "applied" ? (
        <button type="button" disabled={pending} className="text-sm text-muted hover:text-fg disabled:opacity-50" onClick={() => setStatus("hidden")}>
          Hide
        </button>
      ) : null}

      {status !== "drafted" && status !== "applied" ? (
        <button
          type="button"
          disabled={pending}
          className="text-sm text-muted hover:text-fg disabled:opacity-50"
          onClick={() => {
            if (window.confirm("Delete this listing? This removes it from every tab.")) remove();
          }}
        >
          Delete
        </button>
      ) : null}

      {error ? <p className="w-full text-sm text-muted">{error}</p> : null}
    </div>
  );
}
