"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { prepareListingApplication, setListingStatus } from "@/app/admin/job-actions";
import { AdminButton } from "@/components/admin/admin-ui";
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

  async function prepare() {
    setError("");
    const result = await prepareListingApplication(listing.id);
    if (result && !result.ok) setError(result.error);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AdminButton type="button" variant="primary" disabled={pending} onClick={() => void prepare()}>
        Prepare
      </AdminButton>
      {showOpen && listing.applyUrl ? (
        <a href={listing.applyUrl} target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-fg">
          Open posting
        </a>
      ) : null}
      {listing.status !== "skipped" ? (
        <button
          type="button"
          disabled={pending}
          className="text-sm text-muted hover:text-fg disabled:opacity-50"
          onClick={() =>
            start(async () => {
              await setListingStatus(listing.id, "skipped");
              router.refresh();
            })
          }
        >
          Skip
        </button>
      ) : null}
      {error ? <p className="w-full text-sm text-muted">{error}</p> : null}
    </div>
  );
}
