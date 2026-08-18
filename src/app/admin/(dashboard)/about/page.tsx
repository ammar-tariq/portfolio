import { getSiteContent } from "@/lib/content";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AboutAdminPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="font-serif text-3xl">About & social</h1>
      <div className="mt-8">
        <SettingsForm
          mode="about"
          initial={{
            profile: content.profile,
            social: content.social,
            navItems: content.navItems,
            seo: content.seo,
          }}
        />
      </div>
    </div>
  );
}
