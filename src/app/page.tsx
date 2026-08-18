import type { Metadata } from "next";
import { SiteShell } from "@/components/providers/site-shell";
import { Github } from "@/components/github/github";
import { CursorUsage } from "@/components/cursor/cursor-usage";
import { JsonLd } from "@/components/seo/json-ld";
import { CrawlerFallback } from "@/components/seo/crawler-fallback";
import { homeGraphJsonLd, siteUrlFrom } from "@/lib/seo";
import { getSiteContent } from "@/lib/content";
import { getCursorProfile } from "@/lib/cursor-profile";
import { getGithubContributions } from "@/lib/github-contributions";
import { ContentProvider } from "@/components/providers/content-provider";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return {
    alternates: { canonical: siteUrlFrom(content) },
  };
}

export default async function Home() {
  const content = await getSiteContent();
  const handle = content.social.githubHandle || "your-handle";
  const [cursor, contributions] = await Promise.all([
    getCursorProfile(content.social.cursorHandle ?? "your-handle"),
    getGithubContributions(handle),
  ]);
  return (
    <ContentProvider content={content}>
      <JsonLd data={homeGraphJsonLd(content)} />
      <CrawlerFallback content={content} />
      <SiteShell
        github={<Github content={content} contributions={contributions} />}
        cursor={<CursorUsage profile={cursor} />}
      />
    </ContentProvider>
  );
}
