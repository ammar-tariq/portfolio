import { hasGemini } from "@/lib/env";
import { parseSharedJob } from "@/lib/job-posting";
import { ApplicationForm } from "@/components/admin/application-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
}) {
  const params = await searchParams;
  const initial = parseSharedJob(params);

  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Apply</p>
      <h1 className="mt-2 font-serif text-3xl">Apply from your phone</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        No Chrome extension required. Stay signed in with GitHub in Safari or Chrome, add this page to your Home Screen,
        then share or paste a job into it. Applications stay in Mongo — not in the public repo.
      </p>
      <ol className="mt-6 grid gap-2 text-sm text-muted">
        <li>1. iPhone: Share the posting → Copy, open this page, tap Paste clipboard. Or add an iOS Shortcut that opens this URL with the shared link.</li>
        <li>2. Android: Install the site, then Share a job → this app. The posting URL lands in the form.</li>
        <li>3. Generate the resume here, then download the PDF, Copy / Share into LinkedIn Easy Apply, or Send if you have an email.</li>
      </ol>
      <p className="mt-4 text-sm">
        <Link href="/admin/applications" className="text-accent">
          Application history
        </Link>
      </p>
      <div className="mt-8">
        <ApplicationForm canGenerate={hasGemini()} initial={initial} compact />
      </div>
    </div>
  );
}
