import { getSiteContent } from "@/lib/content";
import { hasGemini } from "@/lib/env";
import { SettingsForm } from "@/components/admin/settings-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function AboutAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Site"
        title="Profile"
        description="Name, bio, social links, and the public navigation labels."
      />
      <SettingsForm
        mode="about"
        canDraft={hasGemini()}
        initial={{
          profile: content.profile,
          social: content.social,
          navItems: content.navItems,
          seo: content.seo,
        }}
      />
    </div>
  );
}
