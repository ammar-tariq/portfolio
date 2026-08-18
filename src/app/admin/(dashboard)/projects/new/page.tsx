import { getSiteContent } from "@/lib/content";
import { hasGemini } from "@/lib/env";
import { ProjectForm } from "@/components/admin/project-form";

export default async function NewProjectPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="font-serif text-3xl">New project</h1>
      <div className="mt-8">
        <ProjectForm industries={content.industries} canDraft={hasGemini()} />
      </div>
    </div>
  );
}
