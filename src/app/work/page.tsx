import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui/section";
import { BrandMark } from "@/components/ui/brand-mark";
import { JsonLd } from "@/components/seo/json-ld";
import { siteUrlFrom, workPageGraphJsonLd } from "@/lib/seo";
import { WorkDirectory } from "@/components/work/work-directory";
import { getSiteContent } from "@/lib/content";
import { ContentProvider } from "@/components/providers/content-provider";
import { ogImages } from "@/lib/og";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const siteUrl = siteUrlFrom(content);
  const images = ogImages(content.seo.defaultOgImage, siteUrl, `Portfolio — ${content.profile.name}`);
  const description = `Selected engineering work by ${content.profile.name} — React Native, TypeScript, NestJS, Node.js, IoT, realtime systems, payments, marketplaces, and AI.`;
  return {
    title: "Portfolio",
    description,
    alternates: { canonical: `${siteUrl}/work` },
    openGraph: {
      title: `Portfolio — ${content.profile.name}`,
      description,
      url: `${siteUrl}/work`,
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `Portfolio — ${content.profile.name}`,
      description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  };
}

export default async function WorkIndexPage() {
  const content = await getSiteContent();
  return (
    <ContentProvider content={content}>
      <div className="min-h-svh bg-bg pb-24 text-fg">
        <JsonLd data={workPageGraphJsonLd(content)} />
        <Container className="pt-[max(4rem,calc(env(safe-area-inset-top)+1.25rem))]">
          <Link href="/" className="inline-flex items-center gap-3 text-sm text-muted hover:text-fg">
            <BrandMark className="h-8 w-8" name={content.profile.name} />
            <span>← {content.profile.name}</span>
          </Link>
          <div className="mt-10">
            <Eyebrow>Portfolio</Eyebrow>
            <h1 className="mt-4 font-serif text-[1.85rem] tracking-tight sm:text-4xl md:text-6xl">
              Projects by {content.profile.name}
            </h1>
            <p className="mt-4 max-w-2xl text-muted">{content.seo.description}</p>
          </div>
          <WorkDirectory />
        </Container>
      </div>
    </ContentProvider>
  );
}
