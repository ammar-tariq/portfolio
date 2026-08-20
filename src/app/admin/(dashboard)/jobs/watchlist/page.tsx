import Link from "next/link";
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
        title="Watchlist"
        description="Company career pages the public boards don’t cover (Greenhouse, Lever, Ashby, and more). Add one, then poll it with Poll now — or turn on “Also search extra company boards” in Jobs to include them in every Find jobs run."
        actions={
          <Link href="/admin/jobs" className="text-sm text-muted hover:text-fg">
            Back to jobs
          </Link>
        }
      />
      <WatchlistManager items={items} />
    </div>
  );
}
