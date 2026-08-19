"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { prepareListingApplication, setListingStatus } from "@/app/admin/job-actions";
import { AdminButton, AdminLink } from "@/components/admin/admin-ui";
import { adminButtonClass } from "@/components/admin/admin-styles";
import type { JobListing, ListingStatus } from "@/types/job-search";

export function ListingActions({ listing }: { listing: JobListing }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function setStatus(status: ListingStatus) {
    start(async () => {
      await setListingStatus(listing.id, status);
      router.refresh();
    });
  }

  async function prepare() {
    setError("");
    const result = await prepareListingApplication(listing.id);
    if (result && !result.ok) setError(result.error);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AdminButton type="button" variant="primary" disabled={pending} onClick={() => void prepare()}>
        Prepare application
      </AdminButton>
      <AdminLink href={`/admin/jobs/${listing.id}`}>Details</AdminLink>
      {listing.applyUrl ? (
        <a href={listing.applyUrl} target="_blank" rel="noreferrer" className={adminButtonClass("secondary")}>
          Open posting
        </a>
      ) : null}
      {listing.status !== "saved" ? (
        <AdminButton type="button" variant="ghost" disabled={pending} onClick={() => setStatus("saved")}>
          Save
        </AdminButton>
      ) : null}
      {listing.status !== "skipped" ? (
        <AdminButton type="button" variant="ghost" disabled={pending} onClick={() => setStatus("skipped")}>
          Skip
        </AdminButton>
      ) : null}
      {listing.status !== "hidden" ? (
        <AdminButton type="button" variant="ghost" disabled={pending} onClick={() => setStatus("hidden")}>
          Hide
        </AdminButton>
      ) : null}
      {error ? <p className="w-full text-sm text-muted">{error}</p> : null}
    </div>
  );
}
