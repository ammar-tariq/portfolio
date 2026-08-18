import { getSiteContent } from "@/lib/content";
import { SimpleEditor } from "@/components/admin/simple-editor";

export default async function PhilosophyAdminPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="font-serif text-3xl">Philosophy</h1>
      <div className="mt-8">
        <SimpleEditor kind="principle" items={content.principles as unknown as Record<string, unknown>[]} />
      </div>
    </div>
  );
}
