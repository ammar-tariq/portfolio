import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/content";
import { hasGemini } from "@/lib/env";
import { ProjectForm } from "@/components/admin/project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return (
    <div>
      <h1 className="font-serif text-3xl">Edit {project.title}</h1>
      <div className="mt-8">
        <ProjectForm initial={project} industries={content.industries} canDraft={hasGemini()} />
      </div>
    </div>
  );
}
