import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { projectGraphJsonLd, siteUrlFrom } from "@/lib/seo";
import { ProjectVisual } from "@/components/work/project-visual";
import { ProjectMedia } from "@/components/work/project-screenshots";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { BrandMark } from "@/components/ui/brand-mark";
import { getPublicProject, getSiteContentForParams } from "@/lib/content";
import { industryLabel, industryLabels, projectLiveLabel, publicProjects } from "@/lib/project-helpers";
import { coverImage } from "@/lib/project-media";
import { ogImages } from "@/lib/og";
import { ContentProvider } from "@/components/providers/content-provider";

export const dynamicParams = true;

export async function generateStaticParams() {
  const content = await getSiteContentForParams();
  return publicProjects(content.projects).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicProject(slug);
  if (!result) return { title: "Portfolio", robots: { index: false, follow: false } };
  const { project, content } = result;
  const siteUrl = siteUrlFrom(content);
  const imageSource = coverImage(project) ?? content.seo.defaultOgImage;
  const images = ogImages(imageSource, siteUrl, project.seoLabel);
  return {
    title: `${project.seoLabel} — case study`,
    description: project.seoDescription,
    keywords: [
      content.profile.name,
      "case study",
      "React Native",
      "full-stack",
      ...industryLabels(project, content.industries),
      project.seoLabel,
      ...project.technologies,
    ],
    alternates: { canonical: `${siteUrl}/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.seoLabel,
      description: project.seoDescription,
      url: `${siteUrl}/work/${project.slug}`,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: project.seoLabel,
      description: project.seoDescription,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicProject(slug);
  if (!result) notFound();
  const { project, content } = result;

  return (
    <ContentProvider content={content}>
      <div className="min-h-svh bg-bg pb-20">
        <JsonLd data={projectGraphJsonLd(content, project)} />
        <div className="grain" aria-hidden />
        <Container className="pt-[max(2.5rem,calc(env(safe-area-inset-top)+1rem))]">
          <Link
            href="/#portfolio"
            className="inline-flex items-center gap-3 text-sm text-muted hover:text-fg"
          >
            <BrandMark className="h-8 w-8" name={content.profile.name} />
            Back to {content.profile.firstName}
          </Link>
          <div className="mt-8 overflow-hidden rounded-3xl border border-line">
            <div className="h-[220px] sm:h-[280px] md:h-[380px]">
              <ProjectVisual project={project} />
            </div>
          </div>
          <p className="mt-10 font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
            {industryLabel(project, content.industries)} · {project.role}
          </p>
          <h1 className="mt-3 font-serif text-[1.85rem] tracking-tight sm:text-4xl md:text-6xl">{project.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{project.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {project.github ? (
              <ButtonLink href={project.github} variant="ghost">
                GitHub <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            ) : null}
            {project.liveUrl ? (
              <ButtonLink href={project.liveUrl} variant="ghost">
                {projectLiveLabel(project)} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            ) : null}
            {project.appStoreUrl ? (
              <ButtonLink href={project.appStoreUrl} variant="ghost">
                App Store <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            ) : null}
            {project.webUrl ? (
              <ButtonLink href={project.webUrl} variant="ghost">
                {project.webLabel ?? "Web"} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            ) : null}
          </div>
          <ProjectMedia project={project} heading="h2" />
          {project.challenge || project.solution ? (
            <div className="mt-14 grid gap-10 md:grid-cols-2">
              {project.challenge ? (
                <div>
                  <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                    Challenge
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted">{project.challenge}</p>
                </div>
              ) : null}
              {project.solution ? (
                <div>
                  <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                    Solution
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted">{project.solution}</p>
                </div>
              ) : null}
            </div>
          ) : null}
          {project.architecture.length > 0 ? (
            <section className="mt-14">
              <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                Architecture
              </h2>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {project.architecture.map((item, i) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-line bg-bg-elevated/40 px-5 py-4 text-sm text-muted"
                  >
                    <span className="mr-3 font-mono text-[10px] text-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {project.engineering && project.engineering.length > 0 ? (
            <section className="mt-14">
              <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                Engineering challenges
              </h2>
              <ul className="mt-5 space-y-3">
                {project.engineering.map((item) => (
                  <li key={item} className="border-l border-accent/40 pl-4 text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="mt-14">
            <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
              Technologies
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
          {project.outcome ? (
            <section className="mt-14 rounded-3xl border border-line bg-bg-soft/50 p-6 md:p-8">
              <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                Outcome
              </h2>
              <p className="mt-4 text-lg leading-relaxed">{project.outcome}</p>
            </section>
          ) : null}
        </Container>
      </div>
    </ContentProvider>
  );
}
