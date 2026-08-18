"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "@/types/content";
import { industryLabel } from "@/lib/project-helpers";
import { useContent } from "@/components/providers/content-provider";
import { ProjectVisual } from "./project-visual";
import { TiltCard } from "@/components/ui/tilt";
import { cn } from "@/lib/cn";
import { easeOutExpo } from "@/lib/motion";

export function ProjectCard({
  project,
  index,
  href,
}: {
  project: Project;
  index: number;
  href?: string;
}) {
  const { industries } = useContent();
  const reduced = useReducedMotion();
  const reverse = index % 2 === 1;
  const visualFrom = reverse ? 40 : -40;
  const copyFrom = reverse ? -28 : 28;

  const body = (
    <motion.div
      className="group grid w-full gap-8 text-left lg:grid-cols-2 lg:items-center lg:gap-16"
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.28, margin: "0px 0px -8% 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.12, delayChildren: 0.04 },
        },
      }}
    >
      <motion.div
        className={cn("[perspective:1600px]", reverse && "lg:order-2")}
        variants={{
          hidden: reduced ? { opacity: 1 } : { opacity: 0, x: visualFrom, filter: "blur(8px)" },
          visible: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: { duration: 0.9, ease: easeOutExpo },
          },
        }}
      >
        <TiltCard>
          <div className="overflow-hidden rounded-[24px] border border-line bg-bg-elevated/40 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow] duration-500 group-hover:border-line-strong group-hover:shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="relative h-[220px] overflow-hidden sm:h-[280px] md:h-[380px]">
              <div className="h-full origin-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none">
                <ProjectVisual project={project} caption={false} />
              </div>
            </div>
          </div>
        </TiltCard>
      </motion.div>
      <motion.div
        className={cn("relative", reverse && "lg:order-1")}
        variants={{
          hidden: reduced ? { opacity: 1 } : { opacity: 0, x: copyFrom },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.85, ease: easeOutExpo },
          },
        }}
      >
        <p className="font-serif text-5xl leading-none text-fg/8 transition-colors duration-500 group-hover:text-fg/14 sm:text-6xl md:text-8xl">
          {String(index + 1).padStart(2, "0")}
        </p>
        <p className="mt-4 font-mono text-[11px] tracking-[0.22em] text-subtle uppercase">
          {[industryLabel(project, industries), project.year, project.role.split("·")[0].trim()]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <h3 className="mt-3 font-serif text-3xl tracking-tight md:text-5xl">{project.title}</h3>
        <p className="mt-4 max-w-md text-lg text-muted">{project.tagline}</p>
        <p className="mt-5 break-words font-mono text-[11px] tracking-[0.12em] text-subtle uppercase sm:tracking-[0.16em]">
          {project.technologies.slice(0, 4).join("  /  ")}
        </p>
        <p className="mt-8 inline-flex items-center gap-2 text-sm text-accent transition-[gap] duration-500 group-hover:gap-3">
          Case study
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </p>
      </motion.div>
    </motion.div>
  );

  return (
    <article className="border-t border-line py-10 md:py-14">
      <Link href={href ?? `/work/${project.slug}`} data-cursor="view" className="block">
        {body}
      </Link>
    </article>
  );
}
