import type { Metadata } from "next";
import { SiteShell } from "@/components/providers/site-shell";
import { Github } from "@/components/github/github";
import { CursorUsage } from "@/components/cursor/cursor-usage";
import { JsonLd } from "@/components/seo/json-ld";
import { CrawlerFallback } from "@/components/seo/crawler-fallback";
import { homeGraphJsonLd, routeMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/content";
import { getCursorProfile } from "@/lib/cursor-profile";
import { getGithubContributions } from "@/lib/github-contributions";
import { ContentProvider } from "@/components/providers/content-provider";
import { homeSectionById, type HomeSectionId } from "@/lib/home-sections";

export async function homeMetadata(sectionId: HomeSectionId = "hero"): Promise<Metadata> {
  const content = await getSiteContent();
  const section = homeSectionById(sectionId) ?? homeSectionById("hero")!;
  if (section.id === "hero") {
    return routeMetadata(content, {
      title: content.seo.title,
      description: content.seo.description,
      path: "/",
      type: "profile",
      ogTitle: content.seo.title,
      absoluteTitle: true,
    });
  }
  return routeMetadata(content, {
    title: section.title,
    description: section.description(content),
    path: section.path,
    ogTitle: `${section.title} — ${content.profile.name}`,
  });
}

export async function HomePage({ sectionId = "hero" }: { sectionId?: HomeSectionId }) {
  const content = await getSiteContent();
  const handle = content.social.githubHandle;
  const [cursor, contributions] = await Promise.all([
    getCursorProfile(content.social.cursorHandle ?? handle),
    getGithubContributions(handle),
  ]);
  return (
    <ContentProvider content={content}>
      <JsonLd data={homeGraphJsonLd(content, sectionId)} />
      <CrawlerFallback content={content} sectionId={sectionId} />
      <SiteShell
        github={<Github content={content} contributions={contributions} />}
        cursor={<CursorUsage profile={cursor} />}
      />
    </ContentProvider>
  );
}
