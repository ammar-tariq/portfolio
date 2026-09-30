"use client";

import Link from "next/link";
import { Briefcase, Calendar } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Industry, Project } from "@/types/content";
import { useContent } from "@/components/providers/content-provider";
import { BrandMark } from "@/components/ui/brand-mark";
import { RemoteImage } from "@/components/ui/remote-image";
import { MediaDownloadButton } from "@/components/ui/media-download";
import { Container } from "@/components/ui/section";
import { projectHeroEyebrow } from "@/lib/project-helpers";
import { cn } from "@/lib/cn";
import { easeOutExpo } from "@/lib/motion";
import { industryIcon } from "@/lib/marks";
import { ProjectVisual } from "./project-visual";

export const PROJECT_HERO_HEIGHT =
  "h-[min(56svh,34rem)] min-h-[17.5rem] md:h-[min(68svh,42rem)]";

export function projectHeroHeight() {
  const vh = window.innerHeight;
  if (window.innerWidth >= 768) return Math.min(vh * 0.68, 42 * 16);
  return Math.max(Math.min(vh * 0.56, 34 * 16), 17.5 * 16);
}

export function ProjectHeroMedia({
  project,
  crossfade = false,
}: {
  project: Project;
  crossfade?: boolean;
}) {
  const reduced = useReducedMotion();
  const banner = project.banner;

  return (
    <div className="absolute inset-0">
      {crossfade || !banner ? (
        <div className="absolute inset-0">
          <ProjectVisual project={project} caption={false} />
        </div>
      ) : null}
      {banner ? (
        <motion.div
          className="absolute inset-0"
          initial={crossfade && !reduced ? { opacity: 0, scale: 1.12 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: crossfade ? 0.9 : 0.8, ease: easeOutExpo, delay: crossfade ? 0.12 : 0 }}
        >
          <RemoteImage
            src={banner}
            alt={`${project.title} banner`}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </motion.div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg from-[12%] via-bg/55 to-bg/25" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-bg/50 to-transparent" />
      {banner ? (
        <MediaDownloadButton
          src={banner}
          name={`${project.slug}-banner`}
          className="absolute top-4 right-4 z-20"
        />
      ) : null}
    </div>
  );
}

export function ProjectHeroChrome({
  project,
  eyebrow,
  backHref,
  backLabel,
  delayed = false,
  titleAs = "h1",
  industries = [],
}: {
  project: Project;
  eyebrow: string;
  backHref: string;
  backLabel: string;
  delayed?: boolean;
  titleAs?: "h1" | "p";
  industries?: Industry[];
}) {
  const reduced = useReducedMotion();
  const Title = titleAs;
  const role = project.role.split("·")[0]?.trim();
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-between">
      <Container className="pt-[max(0.85rem,env(safe-area-inset-top))]">
        <motion.div
          initial={delayed && !reduced ? { opacity: 0, y: -8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOutExpo, delay: delayed ? 0.28 : 0 }}
        >
          <Link
            href={backHref}
            className="glass-quiet pointer-events-auto inline-flex items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1 text-sm text-muted hover:text-fg"
          >
            <BrandMark className="h-7 w-7" name={backLabel} />
            {backLabel}
          </Link>
        </motion.div>
      </Container>
      <Container className="pb-8 md:pb-10">
        <motion.div
          initial={delayed && !reduced ? { opacity: 0, y: 22 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOutExpo, delay: delayed ? 0.22 : 0.05 }}
        >
          {project.logo ? (
            <div className="relative mb-4 inline-block">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-line sm:h-16 sm:w-16">
                <RemoteImage src={project.logo} alt={`${project.title} app icon`} fill sizes="64px" className="object-cover" />
              </div>
              <MediaDownloadButton
                src={project.logo}
                name={`${project.slug}-icon`}
                className="absolute -top-1 -right-1 z-10 h-7 w-7"
              />
            </div>
          ) : null}
          {project.industries.length || project.year || role ? (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
              {project.industries.map((id) => {
                const Icon = industryIcon(id);
                const label = industries.find((item) => item.id === id)?.label;
                if (!label) return null;
                return (
                  <span key={id} className="inline-flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label}
                  </span>
                );
              })}
              {project.year ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  {project.year}
                </span>
              ) : null}
              {role ? (
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" aria-hidden />
                  {role}
                </span>
              ) : null}
            </p>
          ) : eyebrow ? (
            <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
          ) : null}
          <Title className="mt-3 max-w-4xl text-[clamp(1.85rem,4vw,3.6rem)] leading-[1.05] font-medium tracking-[-0.03em] text-fg">
            {project.title}
          </Title>
        </motion.div>
      </Container>
    </div>
  );
}

export function ProjectHero({
  project,
  backHref,
  backLabel,
}: {
  project: Project;
  backHref: string;
  backLabel: string;
}) {
  const { industries } = useContent();
  return (
    <header className="relative isolate overflow-hidden">
      <div className={cn("relative overflow-hidden bg-bg-elevated", PROJECT_HERO_HEIGHT)}>
        <ProjectHeroMedia project={project} />
        <ProjectHeroChrome
          project={project}
          eyebrow={projectHeroEyebrow(project, industries)}
          backHref={backHref}
          backLabel={backLabel}
          industries={industries}
        />
      </div>
    </header>
  );
}
