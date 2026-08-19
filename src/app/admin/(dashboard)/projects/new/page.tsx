import { getSiteContent } from "@/lib/content";
import { hasGemini } from "@/lib/env";
import { ProjectForm } from "@/components/admin/project-form";
import { AdminLink, AdminPageHeader } from "@/components/admin/admin-ui";

export default async function NewProjectPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Projects"
        title="New project"
        description="Create a case study. It can stay off the homepage until you feature it."
        actions={<AdminLink href="/admin/projects">All projects</AdminLink>}
      />
      <ProjectForm industries={content.industries} canDraft={hasGemini()} />
    </div>
  );
}
