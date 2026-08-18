import Link from "next/link";
import { JobApplicationModel } from "@/models";
import { connectDb } from "@/lib/db";
import { hasGemini } from "@/lib/env";
import { applicationFromDoc } from "@/lib/job-application";
import { ApplicationForm } from "@/components/admin/application-form";

export default async function ApplicationsPage() {
  await connectDb();
  const docs = await JobApplicationModel.find().sort({ createdAt: -1 }).lean();
  const items = docs.map(applicationFromDoc);

  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Applications</p>
      <h1 className="mt-2 font-serif text-3xl">Job applications</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        History of tailored resumes, cover letters, and screening answers. Files live on Cloudinary; the source copy stays
        in Mongo. On a phone, use{" "}
        <Link href="/admin/apply" className="text-accent">
          Apply
        </Link>{" "}
        — share or paste a posting, no Chrome extension.
      </p>
      <div className="mt-8">
        <ApplicationForm canGenerate={hasGemini()} />
      </div>
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
                  {item.sentAt ? ` · sent ${new Date(item.sentAt).toLocaleDateString()}` : ""}
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
