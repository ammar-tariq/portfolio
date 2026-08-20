import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { JobListingModel } from "@/models";
import { listingFromDoc } from "@/lib/jobs/from-doc";
import { ListingActions } from "@/components/admin/listing-actions";
import { AdminBadge, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function JobListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDb();
  const doc = await JobListingModel.findById(id).lean();
  if (!doc) notFound();
  const item = listingFromDoc(doc);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={item.source}
        title={item.title}
        description={`${item.company}${item.location ? ` · ${item.location}` : ""}`}
        actions={
          <Link href="/admin/jobs" className="text-sm text-muted hover:text-fg">
            Back to jobs
          </Link>
        }
      />
      <div className="flex flex-wrap gap-2">
        <AdminBadge>{item.status}</AdminBadge>
        <AdminBadge>score {item.priorityScore}</AdminBadge>
        {item.remote ? <AdminBadge tone="accent">remote</AdminBadge> : null}
        {item.visaLanguage ? <AdminBadge tone="ok">visa language</AdminBadge> : null}
        {item.citizenshipRequirement ? <AdminBadge tone="warn">citizenship</AdminBadge> : null}
      </div>
      {item.eligibilityNotes ? <p className="text-sm text-muted">{item.eligibilityNotes}</p> : null}
      <ListingActions listing={item} showOpen />
      <AdminPanel className="p-5">
        <p className="font-mono text-[10px] tracking-wide text-subtle uppercase">Description</p>
        <div className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-muted">
          {item.descriptionText || "No description in the feed. Open the posting or paste the JD on New application."}
        </div>
      </AdminPanel>
    </div>
  );
}
