import { getSiteContent } from "@/lib/content";
import { SimpleEditor } from "@/components/admin/simple-editor";

export default async function ExperienceAdminPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="font-serif text-3xl">Experience</h1>
      <div className="mt-8">
        <SimpleEditor kind="experience" items={content.experience as unknown as Record<string, unknown>[]} />
      </div>
    </div>
  );
}
