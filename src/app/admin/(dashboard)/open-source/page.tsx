import { getSiteContent } from "@/lib/content";
import { OpenSourceManager } from "@/components/admin/open-source-manager";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function OpenSourceAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Open source"
        description="Import from GitHub, then edit titles and descriptions before they go public."
      />
      <OpenSourceManager items={content.openSourceProjects} />
    </div>
  );
}
