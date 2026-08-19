import { getSiteContent } from "@/lib/content";
import { SimpleEditor } from "@/components/admin/simple-editor";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function IndustriesAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Site"
        title="Industries"
        description="Filters used on the work grid. Keep labels short."
      />
      <SimpleEditor kind="industry" items={content.industries as unknown as Record<string, unknown>[]} />
    </div>
  );
}
