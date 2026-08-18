import { getSiteContent } from "@/lib/content";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SeoAdminPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="font-serif text-3xl">SEO</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Paste Google Search Console and Bing verification tokens here. Submit{" "}
        <code className="text-fg">/sitemap.xml</code> in Search Console after go-live.
      </p>
      <div className="mt-8">
        <SettingsForm
          mode="seo"
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
