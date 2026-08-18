import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { projectGraphJsonLd, routeMetadata } from "@/lib/seo";
import { ProjectHero } from "@/components/work/project-hero";
import { ProjectMedia } from "@/components/work/project-screenshots";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { getPublicProject, getSiteContentForParams } from "@/lib/content";
import { industryLabels, projectLiveLabel, publicProjects, relatedProjects } from "@/lib/project-helpers";
import { coverImage } from "@/lib/project-media";
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
  if (!result) return { title: "Not found", robots: { index: false, follow: false } };
  const { project, content } = result;
  return routeMetadata(content, {
    title: `${project.seoLabel} — case study`,
    description: project.seoDescription,
    path: `/work/${project.slug}`,
    type: "article",
    ogTitle: `${project.seoLabel} — ${content.profile.name}`,
    imageSource: coverImage(project) ?? content.seo.defaultOgImage,
    imageAlt: project.seoLabel,
    keywords: [
      content.profile.name,
      "case study",
      ...industryLabels(project, content.industries),
      project.seoLabel,
      ...project.technologies,
    ],
    modifiedTime: project.updatedAt,
  });
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
  const related = relatedProjects(project, content.projects);

  return (
    <ContentProvider content={content}>
      <div className="min-h-svh bg-bg pb-20">
        <JsonLd data={projectGraphJsonLd(content, project)} />
        <div className="grain" aria-hidden />
        <ProjectHero
          project={project}
          backHref="/#portfolio"
          backLabel={`Back to ${content.profile.firstName}`}
        />
        <Container className="pt-10">
          <p className="max-w-2xl text-lg text-muted">{project.description}</p>
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
          {related.length > 0 ? (
            <section className="mt-14">
              <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                More work
              </h2>
              <ul className="mt-5 space-y-3">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/work/${item.slug}`} className="link-underline text-fg">
                      {item.seoLabel}
                    </Link>
                    <span className="text-muted"> — {item.tagline}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </Container>
      </div>
    </ContentProvider>
  );
}
