import { connectDb } from "@/lib/db";
import { hasMongo } from "@/lib/env";
import { CompanyWatchModel } from "@/models";
import { watchFromDoc } from "@/lib/jobs/from-doc";
import { WatchlistManager } from "@/components/admin/watchlist-manager";
import { AdminLink, AdminPageHeader } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  if (!hasMongo()) {
    return (
      <div className="space-y-6">
        <AdminPageHeader eyebrow="Jobs" title="Watchlist" description="MongoDB is required." />
      </div>
    );
  }
  await connectDb();
  const items = (await CompanyWatchModel.find().sort({ name: 1 }).lean()).map(watchFromDoc);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Jobs"
        title="Company ATS (optional)"
        description="Only used if you turn on “Also poll optional company ATS tokens” on Job search. Discovery is job-board-first; this is extra Greenhouse/Lever/Ashby tokens, not a required company list."
        actions={<AdminLink href="/admin/jobs">Back to listings</AdminLink>}
      />
      <WatchlistManager items={items} />
    </div>
  );
}
