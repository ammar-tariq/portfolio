"use client";

import { useMemo, useState } from "react";
import { IndustryFilter } from "./industry-filter";
import { useContent } from "@/components/providers/content-provider";
import { activeIndustries, hasIndustry, listedProjects } from "@/lib/project-helpers";
import { ProjectCard } from "./project-card";

export function WorkDirectory() {
  const [industry, setIndustry] = useState<string | "all">("all");
  const { projects, industries } = useContent();
  const listed = listedProjects(projects);
  const filters = useMemo(
    () =>
      activeIndustries(projects, industries).map((item) => ({
        ...item,
        count: listed.filter((project) => hasIndustry(project, item.id)).length,
      })),
    [listed, projects, industries],
  );
  const visible =
    industry === "all" ? listed : listed.filter((project) => hasIndustry(project, industry));

  return (
    <div className="mt-10">
      <IndustryFilter value={industry} onChange={setIndustry} industries={filters} />
      <div className="mt-8 flex flex-col">
        {visible.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={index}
            href={`/work/${project.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
