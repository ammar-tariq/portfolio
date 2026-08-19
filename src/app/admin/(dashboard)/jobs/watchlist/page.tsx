import { connectDb } from "@/lib/db";
import { hasMongo } from "@/lib/env";
import { CompanyWatchModel } from "@/models";
import { watchFromDoc } from "@/lib/jobs/from-doc";
import { WatchlistManager } from "@/components/admin/watchlist-manager";
import { AdminPageHeader } from "@/components/admin/admin-ui";

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
        title="Extra company boards"
        description="Optional. Most people can ignore this — Job search already uses public boards."
        actions={
          <a href="/admin/jobs" className="text-sm text-muted hover:text-fg">
            Back to jobs
          </a>
        }
      />
      <WatchlistManager items={items} />
    </div>
  );
}
