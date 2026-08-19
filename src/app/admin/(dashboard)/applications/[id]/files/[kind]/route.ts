import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { getSession } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { getSiteContentForParams } from "@/lib/content";
import { applicationFromDoc } from "@/lib/job-application";
import { JobApplicationModel } from "@/models";
import {
  answersPdf,
  answersPdfFilename,
  coverLetterPdf,
  coverLetterPdfFilename,
  pdfFileResponse,
  resumePdf,
  resumePdfFilename,
} from "@/lib/resume-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const kinds = new Set(["resume", "cover-letter", "answers"]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; kind: string }> },
) {
  const session = await getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id, kind } = await context.params;
  if (!kinds.has(kind) || !mongoose.isValidObjectId(id)) notFound();

  await connectDb();
  const doc = await JobApplicationModel.findById(id).lean();
  if (!doc) notFound();

  const content = await getSiteContentForParams();
  const application = applicationFromDoc(doc);
  const name = content.profile.name;

  if (kind === "resume") {
    if (!application.resume.summary) notFound();
    const buffer = await resumePdf(content, application);
    return pdfFileResponse(buffer, resumePdfFilename(name, application.resume.targetRole || application.role));
  }

  if (kind === "cover-letter") {
    if (!application.coverLetter.trim()) notFound();
    const buffer = await coverLetterPdf(content, application);
    return pdfFileResponse(buffer, coverLetterPdfFilename(name, application.company));
  }

  if (!application.answers.length) notFound();
  const buffer = await answersPdf(application);
  return pdfFileResponse(buffer, answersPdfFilename(name, application.company));
}
