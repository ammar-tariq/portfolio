"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "@/types/content";
import { useContent } from "@/components/providers/content-provider";
import { BrandMark } from "@/components/ui/brand-mark";
import { RemoteImage } from "@/components/ui/remote-image";
import { Container } from "@/components/ui/section";
import { projectHeroEyebrow } from "@/lib/project-helpers";
import { cn } from "@/lib/cn";
import { easeOutExpo } from "@/lib/motion";
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
            className="object-cover"
          />
        </motion.div>
      ) : null}
      <div className="absolute inset-0 bg-linear-to-t from-bg from-[12%] via-bg/55 to-bg/25" />
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-bg/50 to-transparent" />
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
}: {
  project: Project;
  eyebrow: string;
  backHref: string;
  backLabel: string;
  delayed?: boolean;
  titleAs?: "h1" | "p";
}) {
  const reduced = useReducedMotion();
  const Title = titleAs;
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
            className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-line bg-bg/55 px-3 py-1.5 text-sm text-muted backdrop-blur-xl hover:text-fg"
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
            <div className="relative mb-4 h-14 w-14 overflow-hidden rounded-[22.5%] border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.35)] sm:h-16 sm:w-16">
              <RemoteImage src={project.logo} alt={`${project.title} app icon`} fill sizes="64px" className="object-cover" />
            </div>
          ) : null}
          {eyebrow ? (
            <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
          ) : null}
          <Title className="mt-3 max-w-4xl font-serif text-[1.85rem] tracking-tight text-fg sm:text-4xl md:text-6xl">
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
        />
      </div>
    </header>
  );
}
