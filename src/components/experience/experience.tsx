"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { useContent } from "@/components/providers/content-provider";

export function Experience() {
  const { experience, projects } = useContent();
  const [active, setActive] = useState(experience[0]?.id ?? "");
  const current = experience.find((item) => item.id === active) ?? experience[0];
  if (!current) return null;

  return (
    <Section id="experience">
      <Container>
        <SectionHeader
          eyebrow="Experience"
          title="A career that compounds."
          kicker="From shipping React Native products to leading systems and AI-enabled platforms."
        />
        <Reveal>
          <div className="grid min-w-0 gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <ol className="relative min-w-0 border-l border-line pl-6">
              {experience.map((item) => {
                const selected = item.id === active;
                return (
                  <li key={item.id} className="relative mb-8 last:mb-0">
                    <span
                      className={cn(
                        "absolute top-2 -left-[31px] h-3 w-3 rounded-full border",
                        selected
                          ? "border-accent bg-accent shadow-[0_0_18px_var(--glow)]"
                          : "border-line bg-bg",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setActive(item.id)}
                      data-cursor="link"
                      className="w-full text-left"
                    >
                      <p className="font-mono text-[11px] tracking-[0.2em] text-subtle uppercase">
                        {item.year}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-xl tracking-tight break-words",
                          selected ? "text-fg" : "text-muted",
                        )}
                      >
                        {item.role}
                      </p>
                      <p className="text-sm text-subtle">
                        {item.company} · {item.period}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ol>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="min-w-0 rounded-[24px] border border-line bg-bg-elevated/45 p-5 backdrop-blur-sm sm:rounded-[28px] md:p-8"
            >
              <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                {current.period}
              </p>
              <h3 className="mt-3 font-serif text-2xl tracking-tight md:text-3xl">{current.role}</h3>
              <p className="mt-1 text-muted">
                {current.company}
                {current.location ? ` · ${current.location}` : ""}
              </p>
              <p className="mt-5 leading-relaxed text-muted">{current.summary}</p>
              <ul className="mt-6 space-y-3">
                {current.responsibilities.map((item) => (
                  <li key={item} className="border-l border-line pl-4 text-sm text-muted">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                {current.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-line px-3 py-1 text-xs text-subtle"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {current.projects.length > 0 ? (
                <div className="mt-8">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">
                    Associated work
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {current.projects.map((slug) => {
                      const project = projects.find((item) => item.slug === slug);
                      if (!project) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/work/${slug}`}
                          data-cursor="view"
                          className="rounded-full bg-fg/6 px-3 py-1.5 text-xs text-fg hover:bg-fg/10"
                        >
                          {project.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
