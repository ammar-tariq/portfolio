import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Apple, ArrowUpRight, Braces, Check, Globe, Layers, Lightbulb, Store, TriangleAlert, Wrench } from "lucide-react";
import { GitHubIcon } from "@/components/ui/brand-icons";
import { industryIcon, techIcon } from "@/lib/marks";
import { RemoteImage } from "@/components/ui/remote-image";
import { JsonLd } from "@/components/seo/json-ld";
import { projectGraphJsonLd, routeMetadata } from "@/lib/seo";
import { ProjectHero } from "@/components/work/project-hero";
import { ProjectMedia } from "@/components/work/project-screenshots";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";
import { getPublicProject, getSiteContentForParams } from "@/lib/content";
import { industryLabels, projectLiveLabel, publicProjects, relatedProjects } from "@/lib/project-helpers";
import { coverImage } from "@/lib/project-media";
import { ContentProvider } from "@/components/providers/content-provider";
import { ProjectView } from "@/components/analytics/project-view";
import { serviceAnchorForTechnology } from "@/lib/services";

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
      ...(project.technologies.some((tech) => /react native/i.test(tech))
        ? ["React Native full-stack", "React Native case study"]
        : []),
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
        <ProjectView slug={project.slug} />
        <ProjectHero
          project={project}
          backHref="/portfolio"
          backLabel={`Back to ${content.profile.firstName}`}
        />
        <Container className="pt-10">
          <Reveal>
          <p className="max-w-2xl text-lg text-muted">{project.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {project.github ? (
              <ButtonLink href={project.github} variant="ghost">
                <GitHubIcon className="h-3.5 w-3.5" /> GitHub <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            ) : null}
            {project.liveUrl ? (
              <ButtonLink href={project.liveUrl} variant="ghost">
                <Store className="h-3.5 w-3.5" aria-hidden /> {projectLiveLabel(project)} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            ) : null}
            {project.appStoreUrl ? (
              <ButtonLink href={project.appStoreUrl} variant="ghost">
                <Apple className="h-3.5 w-3.5" aria-hidden /> App Store <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            ) : null}
            {project.webUrl ? (
              <ButtonLink href={project.webUrl} variant="ghost">
                <Globe className="h-3.5 w-3.5" aria-hidden /> {project.webLabel ?? "Web"} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            ) : null}
          </div>
          </Reveal>
          <ProjectMedia project={project} heading="h2" />
          {project.challenge || project.solution ? (
            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {project.challenge ? (
                <Reveal>
                  <div className="glass-quiet h-full rounded-2xl border p-5 md:p-6">
                    <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                      <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
                      Challenge
                    </h2>
                    <p className="mt-4 leading-relaxed text-muted">{project.challenge}</p>
                  </div>
                </Reveal>
              ) : null}
              {project.solution ? (
                <Reveal delay={0.06}>
                  <div className="glass-quiet h-full rounded-2xl border p-5 md:p-6">
                    <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                      <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                      Solution
                    </h2>
                    <p className="mt-4 leading-relaxed text-muted">{project.solution}</p>
                  </div>
                </Reveal>
              ) : null}
            </div>
          ) : null}
          {project.architecture.length > 0 ? (
            <section className="glass-quiet mt-14 rounded-2xl border p-5 md:p-6">
              <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                <Layers className="h-3.5 w-3.5" aria-hidden />
                Architecture
              </h2>
              <ul className="mt-5 border-t border-line">
                {project.architecture.map((item, i) => (
                  <li key={item} className="border-b border-line">
                    <Reveal delay={i * 0.045}>
                      <p className="py-3 text-sm text-muted">
                        <span className="meta-label mr-3 text-accent">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {item}
                      </p>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {project.engineering && project.engineering.length > 0 ? (
            <section className="glass-quiet mt-14 rounded-2xl border p-5 md:p-6">
              <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                <Wrench className="h-3.5 w-3.5" aria-hidden />
                Engineering challenges
              </h2>
              <ul className="mt-5 space-y-3">
                {project.engineering.map((item, index) => (
                  <li key={item}>
                    <Reveal delay={index * 0.05}>
                      <p className="border-l border-accent/40 pl-4 text-muted">{item}</p>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="glass-quiet mt-14 rounded-2xl border p-5 md:p-6">
            <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
              <Braces className="h-3.5 w-3.5" aria-hidden />
              Technologies
            </h2>
            <p className="mt-5 flex max-w-[var(--read)] flex-wrap gap-x-3 gap-y-2 text-sm text-fg/85">
              {project.technologies.map((tech) => {
                const Icon = techIcon(tech);
                const anchor = serviceAnchorForTechnology(tech);
                const body = (
                  <>
                    <Icon className="h-3.5 w-3.5 text-accent" aria-hidden />
                    {tech}
                  </>
                );
                return anchor ? (
                  <Link key={tech} href={`/services#${anchor}`} className="inline-flex items-center gap-1.5 link-underline">
                    {body}
                  </Link>
                ) : (
                  <span key={tech} className="inline-flex items-center gap-1.5">
                    {body}
                  </span>
                );
              })}
            </p>
            <p className="mt-4 text-sm text-muted">
              <Link href="/services" className="link-underline text-fg">
                Services
              </Link>{" "}
              groups React Native, React, Node.js, and AI work.{" "}
              <Link href="/contact" className="link-underline text-fg">
                Contact {content.profile.firstName}
              </Link>{" "}
              about a similar project.
            </p>
          </section>
          {project.outcome ? (
            <Reveal>
              <section className="glass-quiet mt-14 rounded-2xl border p-5 md:p-6">
                <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Outcome
                </h2>
                <p className="mt-4 text-lg leading-relaxed">{project.outcome}</p>
              </section>
            </Reveal>
          ) : null}
          {related.length > 0 ? (
            <Reveal>
              <section className="glass-quiet mt-14 rounded-2xl border p-5 md:p-6">
                <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  More in the portfolio
                </h2>
                <ul className="mt-5 space-y-2">
                  {related.map((item) => {
                    const industryId = item.industries[0];
                    const Industry = industryId ? industryIcon(industryId) : ArrowUpRight;
                    return (
                      <li key={item.slug}>
                        <Link href={`/work/${item.slug}`} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-[var(--dur)] hover:bg-fg/5">
                          {item.logo ? (
                            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line">
                              <RemoteImage src={item.logo} alt="" fill sizes="40px" className="object-cover" />
                            </span>
                          ) : (
                            <Industry className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                          )}
                          <span className="min-w-0">
                            <span className="block text-fg">{item.title}</span>
                            <span className="block truncate text-sm text-muted">{item.tagline}</span>
                          </span>
                          <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-accent" aria-hidden />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </Reveal>
          ) : null}
        </Container>
      </div>
    </ContentProvider>
  );
}
