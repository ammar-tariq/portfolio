import { getSiteContent } from "@/lib/content";
import { SimpleEditor } from "@/components/admin/simple-editor";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function PhilosophyAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Site"
        title="Philosophy"
        description="Principles on the homepage. Select one to edit, or add a new statement."
      />
      <SimpleEditor kind="principle" items={content.principles as unknown as Record<string, unknown>[]} />
    </div>
  );
}
