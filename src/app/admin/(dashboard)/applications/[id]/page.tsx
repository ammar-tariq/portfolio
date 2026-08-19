import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { JobApplicationModel } from "@/models";
import { connectDb } from "@/lib/db";
import { applicationFromDoc } from "@/lib/job-application";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { hasApplicationMail } from "@/lib/gmail-send";
import { getSiteContentForParams } from "@/lib/content";
import { hasGemini } from "@/lib/env";
import { resumePlainText } from "@/lib/job-application";
import { AdminLink, AdminPageHeader } from "@/components/admin/admin-ui";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();
  await connectDb();
  const doc = await JobApplicationModel.findById(id).lean();
  if (!doc) notFound();
  const application = applicationFromDoc(doc);
  const content = await getSiteContentForParams();
  const defaultSubject = `Application for ${application.role} — ${content.profile.name}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Applications"
        title={`${application.role} · ${application.company}`}
        description={
          application.jobUrl ? (
            <a href={application.jobUrl} className="text-accent hover:underline" target="_blank" rel="noreferrer">
              Open job posting
            </a>
          ) : (
            "Draft or sent application"
          )
        }
        actions={<AdminLink href="/admin/applications">Back to inbox</AdminLink>}
      />
      <ApplicationDetail
        application={application}
        canSend={hasApplicationMail()}
        canGenerate={hasGemini()}
        defaultSubject={defaultSubject}
        resumeText={resumePlainText(content, application)}
      />
    </div>
  );
}
