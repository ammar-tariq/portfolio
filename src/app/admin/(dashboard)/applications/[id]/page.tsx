import { notFound } from "next/navigation";
import Link from "next/link";
import mongoose from "mongoose";
import { JobApplicationModel } from "@/models";
import { connectDb } from "@/lib/db";
import { applicationFromDoc } from "@/lib/job-application";
import { ApplicationDetail } from "@/components/admin/application-detail";

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

  return (
    <div>
      <p className="text-sm text-muted">
        <Link href="/admin/applications" className="link-underline">
          Applications
        </Link>
      </p>
      <h1 className="mt-3 font-serif text-3xl">
        {application.role} · {application.company}
      </h1>
      {application.jobUrl ? (
        <p className="mt-2 text-sm">
          <a href={application.jobUrl} className="text-accent" target="_blank" rel="noreferrer">
            Job posting
          </a>
        </p>
      ) : null}
      <div className="mt-8">
        <ApplicationDetail application={application} />
      </div>
    </div>
  );
}
