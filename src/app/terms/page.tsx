import type { Metadata } from "next";
import Link from "next/link";
import { LegalH2, LegalList, LegalP, LegalPage } from "@/components/legal/legal-page";
import { getSiteContent } from "@/lib/content";
import { routeMetadata } from "@/lib/seo";
import { LEGAL_UPDATED } from "@/lib/legal";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return routeMetadata(content, {
    title: "Terms of Service",
    description: `Terms for using ${content.profile.name}’s personal site.`,
    path: "/terms",
  });
}

export default async function TermsPage() {
  const content = await getSiteContent();
  const { profile } = content;
  const siteUrl = profile.website.replace(/\/$/, "");

  return (
    <LegalPage name={profile.name} title="Terms of Service" updated={LEGAL_UPDATED}>
      <LegalP>
        These terms govern use of {siteUrl} (the “Site”), operated by {profile.name}. By using the
        Site, you agree to them. If you do not agree, do not use the Site.
      </LegalP>

      <LegalH2>The Site</LegalH2>
      <LegalP>
        The Site describes my work, writing, and how to contact me. It is provided for information
        and professional outreach. It is not an offer of employment, a client portal, or software
        you license from me by visiting.
      </LegalP>

      <LegalH2>Intellectual property</LegalH2>
      <LegalP>
        Unless a page says otherwise, I own the Site’s original text, layout, and code I published
        here. You may view it in a browser and share links. You may not copy the Site as your own,
        scrape it at a volume that harms the service, or reuse project write-ups as if they were
        yours.
      </LegalP>
      <LegalP>
        Project names, screenshots, logos, and product UI belong to their respective owners. They
        appear to illustrate work I did. Showing them here does not transfer those trademarks or
        claim that those products are mine.
      </LegalP>
      <LegalP>
        Public GitHub repositories linked from the Site are licensed under whatever license each
        repository states.
      </LegalP>

      <LegalH2>No professional advice</LegalH2>
      <LegalP>
        Case studies, architecture notes, and opinions are my experience, not legal, financial, or
        engineering advice for your situation. Do not treat them as a specification you can ship
        without your own review.
      </LegalP>

      <LegalH2>Acceptable use</LegalH2>
      <LegalList
        items={[
          "Do not attempt to access the admin area, other people’s data, or the Site’s infrastructure without authorization.",
          "Do not overload the Site with automated traffic beyond ordinary indexing by search engines.",
          "Do not use the contact details to send spam, malware, or harassment.",
        ]}
      />

      <LegalH2>Third-party sites and embeds</LegalH2>
      <LegalP>
        Links to GitHub, LinkedIn, Calendly, WhatsApp, app stores, Cloudinary-hosted media, and
        other destinations are outside my control. Their terms and privacy policies apply once you
        leave the Site. I am not responsible for their content or availability.
      </LegalP>

      <LegalH2>Analytics and availability</LegalH2>
      <LegalP>
        The Site may log visits as described in the Privacy Policy. The Site is provided “as is.” I
        may change, pause, or take it down at any time. I do not warrant that it will be
        uninterrupted, error-free, or fit for a particular purpose.
      </LegalP>

      <LegalH2>Limitation of liability</LegalH2>
      <LegalP>
        To the fullest extent allowed by law, I am not liable for indirect, incidental, special,
        consequential, or punitive damages, or for lost profits, data, or goodwill, arising from
        your use of the Site. My total liability for any claim relating to the Site is limited to
        zero, because you are not paying to visit.
      </LegalP>
      <LegalP>
        Nothing in these terms limits liability that cannot be limited under applicable law
        (including fraud).
      </LegalP>

      <LegalH2>Governing law</LegalH2>
      <LegalP>
        These terms are governed by the laws of Pakistan, without regard to conflict-of-law rules.
        Courts in Karachi have exclusive jurisdiction, except that I may seek injunctive relief
        anywhere if someone copies the Site or attacks it.
      </LegalP>

      <LegalH2>Changes</LegalH2>
      <LegalP>
        I may update these terms. The “Last updated” date will change. Continued use after an
        update means you accept the new terms.
      </LegalP>

      <LegalH2>Contact</LegalH2>
      <LegalP>
        Questions:{" "}
        <a className="text-fg underline decoration-line underline-offset-4" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        .
      </LegalP>

      <LegalP>
        Related:{" "}
        <Link href="/privacy" className="text-fg underline decoration-line underline-offset-4">
          Privacy Policy
        </Link>
        .
      </LegalP>
    </LegalPage>
  );
}
