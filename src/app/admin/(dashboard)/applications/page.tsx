import Link from "next/link";
import { JobApplicationModel, GmailSyncModel } from "@/models";
import { connectDb } from "@/lib/db";
import { hasGmailApi } from "@/lib/gmail";
import { applicationFromDoc } from "@/lib/job-application";
import { GmailSyncButton } from "@/components/admin/gmail-sync-button";
import { AdminBadge, AdminLink, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

function statusTone(status: string): "muted" | "accent" | "ok" | "warn" {
  if (status === "applied" || status === "offer") return "ok";
  if (status === "draft") return "warn";
  if (status === "interview" || status === "replied") return "accent";
  return "muted";
}

export default async function ApplicationsPage() {
  await connectDb();
  const [docs, sync] = await Promise.all([
    JobApplicationModel.find().sort({ createdAt: -1 }).lean(),
    hasGmailApi() ? GmailSyncModel.findById("gmail").lean() : Promise.resolve(null),
  ]);
  const items = docs.map(applicationFromDoc);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Jobs"
        title="Applications"
        description="Tailored resumes and letters. Start from Jobs, or paste a posting URL."
        actions={
          <Link href="/admin/jobs" className="text-sm text-muted hover:text-fg">
            Add a job
          </Link>
        }
      />

      {hasGmailApi() ? (
        <GmailSyncButton
          lastSyncAt={sync?.lastSyncAt ? new Date(sync.lastSyncAt).toISOString() : undefined}
          lastError={sync?.lastError || undefined}
        />
      ) : null}

      <AdminPanel>
        {items.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <p className="text-sm text-muted">No applications yet.</p>
            <AdminLink href="/admin/jobs" variant="primary" className="mt-4">
              Create the first one
            </AdminLink>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`/admin/applications/${item.id}`}
                  className="block px-4 py-3.5 transition-colors hover:bg-fg/4"
                >
                  <p className="truncate font-medium">
                    {item.role} · {item.company}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <AdminBadge tone={statusTone(item.status)}>{item.status}</AdminBadge>
                    {item.inboxStatus && item.inboxStatus !== "none" ? (
                      <AdminBadge tone={statusTone(item.inboxStatus)}>{item.inboxStatus}</AdminBadge>
                    ) : null}
                    {item.createdAt ? <span>{new Date(item.createdAt).toLocaleDateString()}</span> : null}
                    {item.sentAt ? <span>sent {new Date(item.sentAt).toLocaleDateString()}</span> : null}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
