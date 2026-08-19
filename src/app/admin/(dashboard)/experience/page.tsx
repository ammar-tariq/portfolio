import { getSiteContent } from "@/lib/content";
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
      <SimpleEditor kind="experience" items={content.experience as unknown as Record<string, unknown>[]} />
    </div>
  );
}
