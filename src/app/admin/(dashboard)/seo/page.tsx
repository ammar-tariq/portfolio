import { getSiteContent } from "@/lib/content";
import { hasGemini } from "@/lib/env";
import { SettingsForm } from "@/components/admin/settings-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default async function SeoAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Site"
        title="SEO"
        description={
          <>
            Titles, keywords, and search-console tokens. After go-live, submit{" "}
            <code className="text-fg">/sitemap.xml</code> in Google Search Console.
          </>
        }
      />
      <SettingsForm
        mode="seo"
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
