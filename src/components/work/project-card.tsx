"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types/content";
import { industryLabel, projectHeroEyebrow } from "@/lib/project-helpers";
import { coverImage, coverScreenshots } from "@/lib/project-media";
import { useContent } from "@/components/providers/content-provider";
import { RemoteImage } from "@/components/ui/remote-image";
import { useSkillFocus } from "@/components/skills/skill-focus";
import { shouldPassProjectClick, useProjectOpen } from "./project-open";
import { cn } from "@/lib/cn";

export function ProjectCard({
  project,
  index,
  href,
  onActivate,
}: {
  project: Project;
  index: number;
  href?: string;
  onActivate?: (project: Project | null) => void;
}) {
  const { industries, profile } = useContent();
  const { openProject, pendingSlug } = useProjectOpen();
  const { skill } = useSkillFocus();
  const target = href ?? `/work/${project.slug}`;
  const opening = pendingSlug === project.slug;
  const shots = coverScreenshots(project);
  const image = coverImage(project);
  const frames = shots.length
    ? shots
    : image
      ? [{ src: image, alt: project.title, caption: project.title }]
      : [];
  const related = skill
    ? project.technologies.some((tech) => tech.toLowerCase() === skill.toLowerCase())
    : false;

  return (
    <article
      className={cn(
        "group axis-grid py-3 transition-opacity duration-[var(--dur)]",
        skill && !related && "opacity-35",
      )}
      onMouseEnter={() => onActivate?.(project)}
      onMouseLeave={() => onActivate?.(null)}
      onFocus={() => onActivate?.(project)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onActivate?.(null);
      }}
    >
      <p className="meta-label axis-side pt-1 text-accent">{String(index + 1).padStart(2, "0")}</p>
      <div className="axis-main">
        <Link
          href={target}
          data-cursor="view"
          className={cn(
            "grid items-start gap-6 border border-line p-4 min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:p-6",
            related && "border-accent",
          )}
          onClick={(event) => {
            if (shouldPassProjectClick(event)) return;
            event.preventDefault();
            openProject({
              project,
              href: target,
              origin: event.currentTarget.querySelector("[data-project-origin]") as HTMLElement | null,
              eyebrow: projectHeroEyebrow(project, industries),
              backHref: "/portfolio",
              backLabel: `Back to ${profile.firstName}`,
            });
          }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {project.logo ? (
                <span className="relative h-10 w-10 shrink-0 overflow-hidden border border-line">
                  <RemoteImage src={project.logo} alt="" fill sizes="40px" className="object-cover" />
                </span>
              ) : null}
              <h3 className="text-[clamp(1.45rem,2.2vw,2rem)] leading-none font-medium tracking-[-0.03em]">
                {project.title}
              </h3>
            </div>
            <p className="meta-label mt-3 normal-case tracking-[0.12em]">
              {[industryLabel(project, industries), project.year].filter(Boolean).join("  ·  ")}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">{project.tagline}</p>
            <p className="mt-3 max-w-xl text-sm text-fg/80">{project.technologies.join("  ·  ")}</p>
            <span className="ctrl mt-4 inline-flex items-center gap-1.5 text-muted group-hover:text-fg">
              Case study
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
          {frames.length ? (
            <div className={cn("flex min-w-0 max-w-full gap-2 overflow-x-auto", opening && "invisible")} data-project-origin>
              {frames.map((shot) => (
                <span
                  key={shot.src}
                  className="relative h-48 w-[6.4rem] shrink-0 overflow-hidden border border-line sm:h-56 sm:w-[7.25rem]"
                >
                  <RemoteImage
                      src={shot.src}
                      alt={shot.alt || `${project.title} screenshot`}
                      fill
                      sizes="116px"
                      className="object-cover object-top"
                    />
                </span>
              ))}
            </div>
          ) : (
            <span data-project-origin className="sr-only" />
          )}
        </Link>
      </div>
    </article>
  );
}
