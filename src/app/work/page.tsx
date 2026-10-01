import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/section";
import { BrandMark } from "@/components/ui/brand-mark";
import { JsonLd } from "@/components/seo/json-ld";
import { routeMetadata, workPageGraphJsonLd } from "@/lib/seo";
import { WorkDirectory } from "@/components/work/work-directory";
import { getSiteContent } from "@/lib/content";
import { ContentProvider } from "@/components/providers/content-provider";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const description = `Case studies by ${content.profile.name}: React Native, React, TypeScript, and Node.js products, including backends and AI features where the project used them.`;
  return routeMetadata(content, {
    title: "Portfolio",
    description,
    path: "/work",
    ogTitle: `Portfolio — ${content.profile.name}`,
    keywords: [
      "React Native full-stack",
      "React Native projects",
      "React Native case studies",
      `${content.profile.name} React Native`,
      "NestJS",
      "TypeScript",
      "full-stack mobile engineer",
    ],
  });
}

export default async function WorkIndexPage() {
  const content = await getSiteContent();
  return (
    <ContentProvider content={content}>
      <div className="min-h-svh bg-bg pb-24 text-fg">
        <JsonLd data={workPageGraphJsonLd(content)} />
        <Container className="relative pt-[max(4rem,calc(env(safe-area-inset-top)+1.25rem))]">
          <div className="hero-wash" aria-hidden />
          <Link href="/" className="glass-quiet relative z-[1] inline-flex items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1 text-sm text-muted hover:text-fg">
            <BrandMark className="h-8 w-8" name={content.profile.name} />
            <span>{content.profile.name}</span>
          </Link>
          <div className="relative z-[1] mt-10">
            <h1 className="settle max-w-[16ch] text-[clamp(1.85rem,4vw,3.4rem)] leading-[1.02] font-medium tracking-[-0.03em]">
              Portfolio
            </h1>
            <p className="settle settle-3 mt-4 max-w-2xl text-muted">{content.seo.description}</p>
          </div>
          <div className="relative z-[1]">
            <WorkDirectory />
          </div>
        </Container>
      </div>
    </ContentProvider>
  );
}
