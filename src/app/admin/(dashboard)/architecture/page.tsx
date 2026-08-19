import { getSiteContent } from "@/lib/content";
import { hasGemini } from "@/lib/env";
import { ArchitectureForm } from "@/components/admin/architecture-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function ArchitectureAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Site"
        title="Architecture"
        description="Edit the homepage diagrams as a tree. Generate fills a section from what is already there."
      />
      <ArchitectureForm initial={content.architecture} canDraft={hasGemini()} engineer={content.profile.name} />
    </div>
  );
}
