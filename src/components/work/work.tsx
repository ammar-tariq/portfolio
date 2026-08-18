"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { activeIndustries, featuredProjects, hasIndustry, listedProjects } from "@/lib/project-helpers";
import { IndustryFilter } from "./industry-filter";
import { ButtonLink } from "@/components/ui/button";
import { ProjectCard } from "./project-card";

export function Work() {
  const [industry, setIndustry] = useState<string | "all">("all");
  const { projects, industries } = useContent();
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
        <SectionHeader
          eyebrow="Portfolio"
          title="Products I can still explain."
        />
        <div className="mb-8">
          <IndustryFilter value={industry} onChange={setIndustry} industries={filters} />
        </div>
        <div className="flex flex-col">
          {visible.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              href={`/work/${project.slug}`}
            />
          ))}
        </div>
        {listed.length > visible.length ? (
          <div className="mt-4 flex justify-center border-t border-line pt-10">
            <ButtonLink href="/work">
              View all {listed.length} projects
              <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
