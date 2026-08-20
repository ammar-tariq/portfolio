import Link from "next/link";
import { hasGemini } from "@/lib/env";
import { parseSharedJob } from "@/lib/job-posting";
import { ApplicationForm } from "@/components/admin/application-form";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
}) {
  const params = await searchParams;
  const initial = parseSharedJob(params);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Jobs"
        title="Paste a job URL"
        description="For LinkedIn, Indeed, or any posting the boards miss. Then generate a resume and letter."
        actions={
          <Link href="/admin/applications" className="text-sm text-muted hover:text-fg">
            Back to applications
          </Link>
        }
      />

      <AdminPanel className="p-5">
        <p className="text-sm font-medium">From your phone</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted">
          <li>Stay signed in, then add this page to your Home Screen.</li>
          <li>Share or paste the posting here.</li>
          <li>Generate, then download the PDF or send from the application page.</li>
        </ol>
      </AdminPanel>

      <ApplicationForm canGenerate={hasGemini()} initial={initial} compact />
    </div>
  );
}
