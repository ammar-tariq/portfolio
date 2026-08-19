import { getSiteContent } from "@/lib/content";
import { ArchitectureForm } from "@/components/admin/architecture-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function ArchitectureAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Site"
        title="Architecture"
        description="Identity graph, system layers, AI pipeline, and concepts shown on the homepage."
      />
      <ArchitectureForm initial={content.architecture} />
    </div>
  );
}
