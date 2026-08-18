import { getSiteContent } from "@/lib/content";
import { OpenSourceManager } from "@/components/admin/open-source-manager";

export default async function OpenSourceAdminPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="font-serif text-3xl">Open source</h1>
      <div className="mt-8">
        <OpenSourceManager items={content.openSourceProjects} />
      </div>
    </div>
  );
}
