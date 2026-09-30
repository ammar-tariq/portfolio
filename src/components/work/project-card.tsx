"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/types/content";
import { industryLabel, projectHeroEyebrow } from "@/lib/project-helpers";
import { coverImage } from "@/lib/project-media";
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
  const [recordOpen, setRecordOpen] = useState(false);
  const target = href ?? `/work/${project.slug}`;
  const opening = pendingSlug === project.slug;
  const image = coverImage(project);
  const related = skill
    ? project.technologies.some((tech) => tech.toLowerCase() === skill.toLowerCase())
    : false;

  return (
    <article
      className={cn(
        "group axis-grid border-t border-line py-7 transition-opacity duration-[var(--dur)] last:border-b md:py-8",
        skill && !related && "opacity-35",
        related && "border-accent",
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
          className="relative block"
          onPointerEnter={() => {
            if (!image) return;
            const preload = new window.Image();
            preload.src = image;
          }}
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
          <h3 className="max-w-[16ch] text-[clamp(1.45rem,2.2vw,2rem)] leading-none font-medium tracking-[-0.03em] sm:max-w-none">
            {project.title}
          </h3>
          <p className="meta-label mt-3 normal-case tracking-[0.12em]">
            {[industryLabel(project, industries), project.year].filter(Boolean).join("  ·  ")}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">{project.tagline}</p>
          <p className="mt-3 max-w-xl pr-48 text-sm text-fg/80 max-[719px]:pr-0">{project.technologies.join("  ·  ")}</p>
          <span className="ctrl mt-4 text-muted group-hover:text-fg">Case study</span>
          {image ? (
            <div
              data-project-origin
              className={cn(
                "fine-only pointer-events-none absolute top-0 right-0 z-[1] h-28 w-44 overflow-hidden opacity-0 transition-opacity duration-[var(--dur)] group-hover:opacity-100 group-focus-within:opacity-100",
                opening && "invisible",
              )}
            >
              <RemoteImage
                src={image}
                alt=""
                fill
                sizes="224px"
                className="object-cover object-left-top"
              />
            </div>
          ) : (
            <span data-project-origin className="sr-only" />
          )}
        </Link>
        {image ? (
          <div className="coarse-only mt-4">
          <button
            type="button"
            className="meta-label text-fg"
            aria-expanded={recordOpen}
            onClick={() => setRecordOpen((value) => !value)}
          >
            {recordOpen ? "Hide record" : "View record"}
          </button>
          {recordOpen ? (
            <div className="relative mt-3 aspect-[16/10] max-w-md overflow-hidden">
              <RemoteImage src={image} alt={`${project.title} preview`} fill sizes="(max-width: 768px) 100vw, 28rem" className="object-cover object-left-top" />
            </div>
          ) : null}
        </div>
      ) : null}
      </div>
    </article>
  );
}
