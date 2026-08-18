import { getSiteContent } from "@/lib/content";
import { SimpleEditor } from "@/components/admin/simple-editor";

export default async function IndustriesAdminPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="font-serif text-3xl">Industries</h1>
      <div className="mt-8">
        <SimpleEditor kind="industry" items={content.industries as unknown as Record<string, unknown>[]} />
      </div>
    </div>
  );
}
