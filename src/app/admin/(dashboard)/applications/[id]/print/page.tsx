import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { JobApplicationModel } from "@/models";
import { connectDb } from "@/lib/db";
import { getSiteContentForParams } from "@/lib/content";
import { applicationFromDoc, resumeHtml } from "@/lib/job-application";

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
  const html = resumeHtml(content, applicationFromDoc(doc), { fragment: true });
  return (
    <div className="resume-print mx-auto max-w-3xl bg-white px-6 py-10 text-black">
      <style>{`
        .resume-print h1 { font-size: 1.75rem; margin: 0 0 0.5rem; }
        .resume-print h2 { font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; margin: 1.75rem 0 0.75rem; border-bottom: 1px solid #ddd; padding-bottom: 0.25rem; }
        .resume-print h3 { font-size: 1rem; margin: 0 0 0.25rem; }
        .resume-print ul { margin: 0.5rem 0 1rem 1.25rem; }
        @media print { header, nav { display: none !important; } }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
