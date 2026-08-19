import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/content";
import { hasGemini } from "@/lib/env";
import { ProjectForm } from "@/components/admin/project-form";
import { AdminLink, AdminPageHeader } from "@/components/admin/admin-ui";

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
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Projects"
        title={project.title}
        description={`Editing /work/${project.slug}`}
        actions={<AdminLink href="/admin/projects">All projects</AdminLink>}
      />
      <ProjectForm initial={project} industries={content.industries} canDraft={hasGemini()} />
    </div>
  );
}
