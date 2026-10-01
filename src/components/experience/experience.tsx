"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, ChevronDown } from "lucide-react";
import { Container, Section, SectionIntro } from "@/components/ui/section";
import { RemoteImage } from "@/components/ui/remote-image";
import { useContent } from "@/components/providers/content-provider";
import { projectHeroEyebrow } from "@/lib/project-helpers";
import { coverImage } from "@/lib/project-media";
import { dossierEntry } from "@/lib/dossier";
import { Reveal } from "@/components/ui/reveal";
import { shouldPassProjectClick, useProjectOpen } from "@/components/work/project-open";

export function Experience() {
  const { experience, projects, industries, profile, navItems } = useContent();
  const { openProject } = useProjectOpen();
  const entry = dossierEntry("experience");
  const label = navItems.find((item) => item.id === "experience")?.label ?? entry?.label ?? "Experience";
  const [openId, setOpenId] = useState(experience[0]?.id ?? "");
  if (experience.length === 0) return null;

  return (
    <Section id="experience">
      <Container>
        <SectionIntro
          marker={entry?.marker ?? "03"}
          label={label}
          title="A career that compounds."
          kicker="From shipping React Native products to leading systems and AI-enabled platforms."
        />
        <ol className="border-t border-line">
          {experience.map((item, index) => {
            const open = item.id === openId;
            return (
              <li key={item.id} className="axis-grid border-b border-line py-7 md:py-9">
                <Reveal delay={index * 0.06}>
                <p className="axis-side text-sm tabular-nums tracking-tight text-fg">{item.year}</p>
                <div className="axis-main">
                  <h3 className="flex items-center gap-2 text-xl tracking-tight md:text-2xl">
                    <Briefcase className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                    {item.role}
                  </h3>
                      <p className="mt-1 text-sm text-muted">
                        {item.company}
                        {item.location ? ` · ${item.location}` : ""}
                        <span className="text-subtle"> · {item.period}</span>
                      </p>
                      <p className="mt-4 max-w-[var(--read)] leading-relaxed text-muted">{item.summary}</p>
                      {item.projects.length > 0 ? (
                        <div className="mt-4 flex gap-2">
                          {item.projects.map((slug) => {
                            const project = projects.find((entryItem) => entryItem.slug === slug);
                            const src = project ? coverImage(project) : undefined;
                            if (!project || !src) return null;
                            return (
                              <Link
                                key={slug}
                                href={`/work/${slug}`}
                                className="shot-frame relative h-16 w-11 bg-bg-elevated"
                              >
                                <RemoteImage src={src} alt={`${project.title} screenshot`} fill sizes="44px" className="zoom-shot object-cover object-top" />
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className="meta-label mt-4 inline-flex items-center gap-1.5 text-fg"
                        aria-expanded={open}
                        onClick={() => setOpenId(open ? "" : item.id)}
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-[var(--dur)] ${open ? "rotate-180" : ""}`} aria-hidden />
                        {open ? "Hide scope" : "Scope"}
                      </button>
                      {open ? (
                        <div className="settle mt-4">
                          <ul className="max-w-[var(--read)] space-y-2">
                            {item.responsibilities.map((line) => (
                              <li key={line} className="flex gap-2 text-sm leading-relaxed text-muted">
                                <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                                {line}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-4 text-sm text-fg/80">{item.technologies.join(" · ")}</p>
                          {item.projects.length > 0 ? (
                            <p className="mt-3 text-sm">
                              <span className="meta-label mr-3">Portfolio</span>
                              {item.projects.map((slug, index) => {
                                const project = projects.find((entryItem) => entryItem.slug === slug);
                                if (!project) return null;
                                return (
                                  <span key={slug}>
                                    {index > 0 ? <span className="text-subtle"> · </span> : null}
                                    <Link
                                      href={`/work/${slug}`}
                                      data-cursor="view"
                                      className="link-underline"
                                      onClick={(event) => {
                                        if (shouldPassProjectClick(event)) return;
                                        event.preventDefault();
                                        openProject({
                                          project,
                                          href: `/work/${slug}`,
                                          origin: event.currentTarget,
                                          eyebrow: projectHeroEyebrow(project, industries),
                                          backHref: "/portfolio",
                                          backLabel: `Back to ${profile.firstName}`,
                                        });
                                      }}
                                    >
                                      {project.title}
                                    </Link>
                                  </span>
                                );
                              })}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                </div>
                </Reveal>
              </li>
              );
            })}
          </ol>
      </Container>
    </Section>
  );
}
