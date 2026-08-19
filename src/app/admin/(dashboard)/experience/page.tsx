import { getSiteContent } from "@/lib/content";
import { hasGemini } from "@/lib/env";
import { SimpleEditor } from "@/components/admin/simple-editor";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function ExperienceAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Experience"
        description="Select a role to edit, or add a new one. Order on the site follows this list."
      />
      <SimpleEditor kind="experience" canDraft={hasGemini()} items={content.experience as unknown as Record<string, unknown>[]} />
    </div>
  );
}
