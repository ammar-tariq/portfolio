import type { Metadata } from "next";
import Link from "next/link";
import { LegalH2, LegalList, LegalP, LegalPage } from "@/components/legal/legal-page";
import { getSiteContent } from "@/lib/content";
import { siteUrlFrom } from "@/lib/seo";

const UPDATED = "18 August 2026";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const siteUrl = siteUrlFrom(content);
  return {
    title: "Privacy Policy",
    description: `How ${content.profile.name} collects and uses information on this site.`,
    alternates: { canonical: `${siteUrl}/privacy` },
  };
}

export default async function PrivacyPage() {
  const content = await getSiteContent();
  const { profile } = content;
  const siteUrl = siteUrlFrom(content);

  return (
    <LegalPage name={profile.name} title="Privacy Policy" updated={UPDATED}>
      <LegalP>
        This policy describes how {profile.name} (“I”, “me”) handles information on {siteUrl} (the
        “Site”). This is my personal site. It is not a consumer product, marketplace, or
        account-based service for the public.
      </LegalP>

      <LegalH2>Who is responsible</LegalH2>
      <LegalP>
        I operate the Site independently. For privacy questions, email{" "}
        <a className="text-fg underline decoration-line underline-offset-4" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        . I am based in {profile.location}.
      </LegalP>

      <LegalH2>Information the Site collects</LegalH2>
      <LegalP>If you only browse, I may collect:</LegalP>
      <LegalList
        items={[
          "Pages you view, approximate time on the Site, and the previous site that referred you (if the browser sends one).",
          "Approximate location derived from IP address (country, region, city). The Site does not request GPS or browser location permission.",
          "A hashed daily visitor identifier derived from IP address, used to count visits rather than to identify you by name.",
          "A temporary session id stored in your browser’s session storage so a single visit can be summarized.",
        ]}
      />
      <LegalP>
        There is no public contact form. If you email, message, or book a meeting using the links on
        the Site, that happens in your email client, WhatsApp, Calendly, or similar third-party
        tools under their own policies.
      </LegalP>

      <LegalH2>How that information is used</LegalH2>
      <LegalList
        items={[
          "To understand which work people look at and how they found the Site.",
          "To send myself an optional visit summary (for example by email) when a session ends, or a digest of visits. Those messages go to my inbox, not to advertisers.",
          "To operate the Site, debug issues, and keep it secure.",
        ]}
      />
      <LegalP>I do not sell personal information. I do not use the visit log to run ads on this Site.</LegalP>

      <LegalH2>Cookies and similar storage</LegalH2>
      <LegalList
        items={[
          "Theme preference may be stored in local storage on your device so light or dark mode persists.",
          "Visit session data may be stored in session storage for the duration of your tab.",
          "If you sign in to the private admin area, a session cookie is set by the authentication provider (GitHub OAuth). That area is only for me.",
        ]}
      />
      <LegalP>The public Site does not use advertising cookies.</LegalP>

      <LegalH2>Optional Google Analytics</LegalH2>
      <LegalP>
        If Google Analytics or Google Tag Manager is enabled, Google may collect device and usage
        data under{" "}
        <a
          className="text-fg underline decoration-line underline-offset-4"
          href="https://policies.google.com/privacy"
        >
          Google’s Privacy Policy
        </a>
        . You can also use Google’s opt-out tools where they apply.
      </LegalP>

      <LegalH2>Third-party services</LegalH2>
      <LegalP>The Site relies on processors to run at all:</LegalP>
      <LegalList
        items={[
          "Hosting and TLS on a virtual private server and reverse proxy.",
          "MongoDB Atlas to store website content and first-party visit records.",
          "Cloudinary to host project images and video.",
          "GitHub for admin sign-in and to display a public contribution graph.",
          "Cursor’s public profile page to display public agent-usage stats, when that section is shown.",
          "Email (Gmail SMTP) and, if configured, Firebase Cloud Messaging for my own visit alerts — not push notifications to you as a visitor.",
        ]}
      />
      <LegalP>
        Outbound links (GitHub, LinkedIn, Calendly, WhatsApp, app stores, and the like) are covered
        by those services, not by this policy.
      </LegalP>

      <LegalH2>How long data is kept</LegalH2>
      <LegalP>
        Website content stays until I change or delete it. Visit records are kept so I can review
        traffic over time and may be deleted or reduced when they are no longer useful. Admin
        session cookies last only while I am signed in.
      </LegalP>

      <LegalH2>Your choices</LegalH2>
      <LegalP>
        You can stop using the Site, block cookies and site data in your browser, or use a VPN. To
        ask about visit records associated with a specific time or to request deletion where I can
        reasonably identify them, email {profile.email}. I may need enough detail to find the
        records. I cannot always identify a person from a hashed IP.
      </LegalP>

      <LegalH2>Children</LegalH2>
      <LegalP>
        The Site is aimed at adults considering professional work. It is not directed at children
        under 13, and I do not knowingly collect personal information from them.
      </LegalP>

      <LegalH2>International visitors</LegalH2>
      <LegalP>
        The Site is hosted and the visit database is processed outside your country (including the
        United States for typical cloud providers). If you visit from the EU/UK or similar
        jurisdictions, the legal basis for first-party analytics is my legitimate interest in
        understanding traffic to my site, together with any consent tools your browser
        or Google provides.
      </LegalP>

      <LegalH2>Changes</LegalH2>
      <LegalP>
        I may update this policy. The “Last updated” date at the top will change. Continued use of
        the Site after an update means you accept the revised policy.
      </LegalP>

      <LegalP>
        Related:{" "}
        <Link href="/terms" className="text-fg underline decoration-line underline-offset-4">
          Terms of Service
        </Link>
        .
      </LegalP>
    </LegalPage>
  );
}
