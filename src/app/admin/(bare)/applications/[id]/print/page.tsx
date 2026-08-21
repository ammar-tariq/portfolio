import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { JobApplicationModel } from "@/models";
import { connectDb } from "@/lib/db";
import { getSiteContentForParams } from "@/lib/content";
import { applicationFromDoc, resumeHtml, siteDefaultResumeTemplate } from "@/lib/job-application";
import { resolveResumeTemplateId, resumeTemplateCss, resumeTemplateMeta } from "@/lib/resume-templates";

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
  if (!application.resume.summary) notFound();

  const templateId = resolveResumeTemplateId(
    application.resumeTemplate,
    siteDefaultResumeTemplate(content),
  );
  const meta = resumeTemplateMeta(templateId);
  const html = resumeHtml(content, application, { fragment: true, templateId });
  const css = resumeTemplateCss(templateId);
  const pdfHref = `/admin/applications/${id}/files/resume`;

  return (
    <div className="resume-a4-root">
      <style>{`
        ${css}

        @media screen {
          html { background: #c8c8ce; }
          body { margin: 0; }
          .resume-a4-root {
            min-height: 100vh;
            padding: 20px 16px 48px;
            background: #c8c8ce;
          }
          .preview-toolbar {
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            max-width: 210mm;
            margin: 0 auto 14px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px 16px;
            align-items: center;
            justify-content: space-between;
            color: #1a1a1e;
          }
          .preview-toolbar .meta {
            font-size: 12px;
            color: #444;
          }
          .preview-toolbar .meta strong {
            display: block;
            font-size: 13px;
            color: #111;
            margin-bottom: 2px;
          }
          .preview-toolbar .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .preview-toolbar a {
            display: inline-flex;
            align-items: center;
            height: 34px;
            padding: 0 14px;
            border-radius: 999px;
            font-size: 13px;
            text-decoration: none;
            border: 1px solid #333;
            color: #111;
            background: #fff;
          }
          .preview-toolbar a.primary {
            background: #111;
            color: #fff;
            border-color: #111;
          }
          .a4-sheet {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: #fff;
            box-shadow: 0 4px 24px rgba(0,0,0,.14);
            padding: 14mm 15mm 16mm;
          }
          .a4-sheet .resume {
            max-width: none;
          }
        }

        @media print {
          .preview-toolbar { display: none !important; }
          .resume-a4-root { background: #fff; padding: 0; }
          .a4-sheet {
            width: auto;
            min-height: 0;
            margin: 0;
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>

      <div className="preview-toolbar">
        <div className="meta">
          <strong>A4 preview · {meta.label}</strong>
          Same HTML the PDF uses. Check page breaks here, then open the PDF.
        </div>
        <div className="actions">
          <a href={pdfHref} target="_blank" rel="noreferrer" className="primary">
            Confirm → PDF
          </a>
          <a href={`/admin/applications/${id}`}>Back to application</a>
        </div>
      </div>

      <div className="a4-sheet">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
