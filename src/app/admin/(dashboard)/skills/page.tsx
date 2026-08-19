import { getSiteContent } from "@/lib/content";
import { SimpleEditor } from "@/components/admin/simple-editor";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function SkillsAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Skills"
        description="Skill groups shown on the site. Select a group to edit its items."
      />
      <SimpleEditor kind="skill" items={content.skillCategories as unknown as Record<string, unknown>[]} />
    </div>
  );
}
