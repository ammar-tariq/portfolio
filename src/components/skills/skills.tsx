"use client";

import { Container, Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useContent } from "@/components/providers/content-provider";

export function Skills() {
  const { skillCategories } = useContent();
  return (
    <Section id="skills">
      <Container>
        <SectionHeader
          eyebrow="Stack"
          title="The materials I actually ship with."
        />
        <Reveal>
          <div className="grid gap-3 md:grid-cols-2">
            {skillCategories.map((category) => (
              <article
                id={`skill-${category.id}`}
                key={category.id}
                className="scroll-mt-[calc(6rem+env(safe-area-inset-top,0px))] rounded-2xl border border-line bg-bg-elevated/40 p-5 transition-[border-color,box-shadow] duration-500 target:border-accent target:shadow-[0_0_0_1px_var(--accent)] md:p-6"
              >
                <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                  {category.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{category.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <span
                      key={item.name}
                      className="rounded-full border border-line bg-bg/50 px-3 py-1 text-xs text-fg"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
