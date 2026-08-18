import Link from "next/link";
import { JobApplicationModel, GmailSyncModel } from "@/models";
import { connectDb } from "@/lib/db";
import { hasGemini } from "@/lib/env";
import { hasGmailApi } from "@/lib/gmail";
import { applicationFromDoc } from "@/lib/job-application";
import { ApplicationForm } from "@/components/admin/application-form";
import { GmailSyncButton } from "@/components/admin/gmail-sync-button";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  await connectDb();
  const [docs, sync] = await Promise.all([
    JobApplicationModel.find().sort({ createdAt: -1 }).lean(),
    hasGmailApi() ? GmailSyncModel.findById("gmail").lean() : Promise.resolve(null),
  ]);
  const items = docs.map(applicationFromDoc);

  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Applications</p>
      <h1 className="mt-2 font-serif text-3xl">Job applications</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        History of tailored resumes, cover letters, and screening answers. Source copy stays in Mongo. On a phone, use{" "}
        <Link href="/admin/apply" className="text-accent">
          Apply
        </Link>{" "}
        — share or paste a posting, no Chrome extension.
      </p>
      <div className="mt-8">
        <ApplicationForm canGenerate={hasGemini()} />
      </div>
      {hasGmailApi() ? (
        <GmailSyncButton
          lastSyncAt={sync?.lastSyncAt ? new Date(sync.lastSyncAt).toISOString() : undefined}
          lastError={sync?.lastError || undefined}
        />
      ) : null}
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {items.length === 0 ? (
          <li className="py-4 text-sm text-muted">No applications yet.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-fg">
                  {item.role} · {item.company}
                </p>
                <p className="text-sm text-muted">
                  {item.status}
                  {item.inboxStatus ? ` · ${item.inboxStatus}` : ""}
                  {item.sentAt ? ` · sent ${new Date(item.sentAt).toLocaleDateString()}` : ""}
                  {item.lastReplyAt ? ` · reply ${new Date(item.lastReplyAt).toLocaleDateString()}` : ""}
                  {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleDateString()}` : ""}
                  {item.keywords.length ? ` · ${item.keywords.length} keywords` : ""}
                </p>
              </div>
              <Link href={`/admin/applications/${item.id}`} className="text-sm text-accent">
                Open
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
