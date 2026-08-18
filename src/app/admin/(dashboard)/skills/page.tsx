import { getSiteContent } from "@/lib/content";
import { SimpleEditor } from "@/components/admin/simple-editor";

export default async function SkillsAdminPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="font-serif text-3xl">Skills</h1>
      <div className="mt-8">
        <SimpleEditor kind="skill" items={content.skillCategories as unknown as Record<string, unknown>[]} />
      </div>
    </div>
  );
}
