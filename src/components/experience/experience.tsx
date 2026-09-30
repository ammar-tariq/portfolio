"use client";

import { useState } from "react";
import Link from "next/link";
import { Container, Section, SectionIntro } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { projectHeroEyebrow } from "@/lib/project-helpers";
import { dossierEntry } from "@/lib/dossier";
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
          {experience.map((item) => {
            const open = item.id === openId;
            return (
              <li key={item.id} className="axis-grid border-b border-line py-7 md:py-9">
                <p className="axis-side text-sm tabular-nums tracking-tight text-fg">{item.year}</p>
                <div className="axis-main">
                  <h3 className="text-xl tracking-tight md:text-2xl">{item.role}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {item.company}
                        {item.location ? ` · ${item.location}` : ""}
                        <span className="text-subtle"> · {item.period}</span>
                      </p>
                      <p className="mt-4 max-w-[var(--read)] leading-relaxed text-muted">{item.summary}</p>
                      <button
                        type="button"
                        className="meta-label mt-4 text-fg"
                        aria-expanded={open}
                        onClick={() => setOpenId(open ? "" : item.id)}
                      >
                        {open ? "Hide scope" : "Scope"}
                      </button>
                      {open ? (
                        <div className="mt-4">
                          <ul className="max-w-[var(--read)] space-y-2">
                            {item.responsibilities.map((line) => (
                              <li key={line} className="text-sm leading-relaxed text-muted">
                                {line}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-4 text-sm text-fg/80">{item.technologies.join(" · ")}</p>
                          {item.projects.length > 0 ? (
                            <p className="mt-3 text-sm">
                              <span className="meta-label mr-3">Work</span>
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
              </li>
              );
            })}
          </ol>
      </Container>
    </Section>
  );
}
