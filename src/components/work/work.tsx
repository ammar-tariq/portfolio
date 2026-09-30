"use client";

import { useState } from "react";
import { Container, Section, SectionIntro } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { activeIndustries, featuredProjects, hasIndustry, listedProjects } from "@/lib/project-helpers";
import { dossierEntry } from "@/lib/dossier";
import { IndustryFilter } from "./industry-filter";
import { ButtonLink } from "@/components/ui/button";
import { ProjectCard } from "./project-card";
import type { Project } from "@/types/content";

export function Work() {
  const [industry, setIndustry] = useState<string | "all">("all");
  const [active, setActive] = useState<Project | null>(null);
  const { projects, industries, navItems } = useContent();
  const entry = dossierEntry("portfolio");
  const label = navItems.find((item) => item.id === "portfolio")?.label ?? entry?.label ?? "Work";
  const listed = listedProjects(projects);
  const featured = featuredProjects(projects);
  const filters = activeIndustries(featured, industries).map((item) => ({
    ...item,
    count: featured.filter((project) => hasIndustry(project, item.id)).length,
  }));

  const visible =
    industry === "all" ? featured : featured.filter((project) => hasIndustry(project, industry));

  return (
    <Section id="portfolio">
      <Container>
        <SectionIntro
          marker={entry?.marker ?? "02"}
          label={label}
          title="Products I can still explain."
          kicker="Selected case studies across mobile, web, backend, and AI — with the architecture behind them."
          aside={
            <span aria-live="polite">
              {active
                ? `${active.title}${active.year ? ` · ${active.year}` : ""}`
                : `${visible.length} records`}
            </span>
          }
        />
        <div className="axis-grid mb-2">
          <div className="axis-side max-[719px]:hidden" aria-hidden />
          <div className="axis-main">
            <IndustryFilter value={industry} onChange={setIndustry} industries={filters} />
          </div>
        </div>
        <div>
          {visible.length === 0 ? (
            <p className="axis-grid border-t border-line py-8 text-sm text-muted">
              <span className="axis-side max-[719px]:hidden" aria-hidden />
              <span className="axis-main">No records in this filter.</span>
            </p>
          ) : (
            visible.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={featured.findIndex((item) => item.slug === project.slug)}
                href={`/work/${project.slug}`}
                onActivate={setActive}
              />
            ))
          )}
        </div>
        {listed.length > visible.length ? (
          <div className="axis-grid mt-8">
            <div className="axis-side max-[719px]:hidden" aria-hidden />
            <div className="axis-main">
              <ButtonLink href="/work">View all {listed.length} projects</ButtonLink>
            </div>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
