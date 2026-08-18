"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { DiagramFrame, DiagramNode, Connector } from "@/components/ui/diagram";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { useContent } from "@/components/providers/content-provider";

export function Identity() {
  const { architecture, skillCategories } = useContent();
  const identityGraph = architecture.identityGraph;
  const [active, setActive] = useState(identityGraph.branches[0]?.id ?? "frontend");
  const branch = identityGraph.branches.find((item) => item.id === active);
  const skills = skillCategories.find((category) => category.id === active);

  const detail =
    active === "engineer"
      ? identityGraph.root.detail
      : active === "architecture"
        ? identityGraph.foundation.detail
        : (branch?.detail ?? identityGraph.root.detail);

  return (
    <Section id="identity">
      <Container>
        <SectionHeader
          eyebrow="Practice"
          title="One spine. Four surfaces."
          kicker="Mobile, web, backend, and AI — held together by architecture."
        />
        <Reveal>
          <DiagramFrame>
            <div className="mx-auto max-w-2xl">
              <DiagramNode
                id="engineer"
                label={identityGraph.root.label}
                kicker="Identity"
                active={active === "engineer"}
                onSelect={setActive}
                wide
              />
            </div>
            <Connector />
            <div className="relative mx-auto hidden h-px max-w-4xl bg-line-strong md:block" />
            <div className="mt-0 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {identityGraph.branches.map((item) => (
                <div key={item.id} className="flex flex-col items-center">
                  <div className="mb-3 hidden h-8 w-px bg-linear-to-b from-line-strong to-accent/40 md:block" />
                  <DiagramNode
                    id={item.id}
                    label={item.label}
                    active={active === item.id}
                    onSelect={setActive}
                    wide
                  />
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {item.children.map((child) => (
                      <span
                        key={child}
                        className={cn(
                          "rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide",
                          active === item.id
                            ? "border-accent/40 text-accent"
                            : "border-line text-subtle",
                        )}
                      >
                        {child}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 hidden grid-cols-4 md:grid">
              {identityGraph.branches.map((item) => (
                <div key={`down-${item.id}`} className="flex justify-center">
                  <div className="h-8 w-px bg-linear-to-b from-accent/30 to-line-strong" />
                </div>
              ))}
            </div>
            <div className="relative mx-auto hidden h-px max-w-4xl bg-line-strong md:block" />
            <Connector />
            <div className="mx-auto max-w-xl">
              <DiagramNode
                id="architecture"
                label={identityGraph.foundation.label}
                kicker="Foundation"
                active={active === "architecture"}
                onSelect={setActive}
                wide
              />
            </div>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-8 max-w-xl text-center"
            >
              <p className="text-sm leading-relaxed text-muted md:text-base">{detail}</p>
              {skills ? (
                <p className="mt-4 break-words font-mono text-[11px] tracking-wide text-subtle">
                  {skills.items.map((item) => item.name).join("  ·  ")}
                </p>
              ) : null}
            </motion.div>
          </DiagramFrame>
        </Reveal>
      </Container>
    </Section>
  );
}
