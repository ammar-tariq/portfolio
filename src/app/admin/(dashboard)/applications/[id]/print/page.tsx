import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { JobApplicationModel } from "@/models";
import { connectDb } from "@/lib/db";
import { getSiteContentForParams } from "@/lib/content";
import { applicationFromDoc, resumeHtml, siteDefaultResumeTemplate } from "@/lib/job-application";
import { resolveResumeTemplateId, resumeTemplateCss } from "@/lib/resume-templates";

export default async function ApplicationPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();
  await connectDb();
  const doc = await JobApplicationModel.findById(id).lean();
  if (!doc) notFound();
  const content = await getSiteContentForParams();
  const application = applicationFromDoc(doc);
  const templateId = resolveResumeTemplateId(
    application.resumeTemplate,
    siteDefaultResumeTemplate(content),
  );
  const html = resumeHtml(content, application, { fragment: true, templateId });
  const css = resumeTemplateCss(templateId);

  return (
    <div className="resume-print-root bg-white text-black">
      <style>{`
        ${css}
        @media screen {
          .resume-print-root { min-height: 100vh; padding: 24px 16px 48px; background: #e8e8ea; }
          .resume { background: #fff; box-shadow: 0 1px 8px rgba(0,0,0,.08); }
        }
        @media print {
          .resume-print-root { background: #fff; padding: 0; }
          header, nav, .admin-chrome { display: none !important; }
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
