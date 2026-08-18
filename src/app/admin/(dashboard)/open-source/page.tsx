import { getSiteContent } from "@/lib/content";
import { SimpleEditor } from "@/components/admin/simple-editor";

export default async function OpenSourceAdminPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="font-serif text-3xl">Open source</h1>
      <div className="mt-8">
        <SimpleEditor kind="opensource" items={content.openSourceProjects as unknown as Record<string, unknown>[]} />
      </div>
    </div>
  );
}
