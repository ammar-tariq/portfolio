"use client";

import { useState } from "react";
import { Container, Section, SectionIntro } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { dossierEntry } from "@/lib/dossier";
import { cn } from "@/lib/cn";

export function Identity() {
  const { architecture, skillCategories } = useContent();
  const identityGraph = architecture.identityGraph;
  const entry = dossierEntry("identity");
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
        <SectionIntro
          marker={entry?.marker ?? "05"}
          label={entry?.label ?? "Systems"}
          title="One spine. Four surfaces."
          kicker="Mobile, web, backend, and AI — held together by architecture."
        />
        <div className="axis-grid">
          <div className="axis-side max-[719px]:hidden" />
          <div className="axis-main">
            <button
              type="button"
              onClick={() => setActive(identityGraph.root.id)}
              className={cn(
                "block text-left text-lg tracking-tight",
                active === identityGraph.root.id ? "text-accent" : "text-fg",
              )}
              aria-pressed={active === identityGraph.root.id}
            >
              {identityGraph.root.label}
            </button>
            <ul className="mt-6 border-l border-line">
              {identityGraph.branches.map((item) => {
                const selected = active === item.id;
                const offset = item.id === "ai";
                return (
                  <li key={item.id} className={cn("border-b border-line", offset && "ml-8 min-[800px]:ml-16")}>
                    <button
                      type="button"
                      onClick={() => setActive(item.id)}
                      aria-pressed={selected}
                      className="grid w-full gap-2 py-4 pl-5 text-left min-[800px]:grid-cols-[9rem_minmax(0,1fr)] min-[800px]:items-baseline"
                    >
                      <span className={cn("text-base tracking-tight", selected ? "text-accent" : "text-fg")}>
                        {item.label}
                      </span>
                      <span className="text-sm text-muted">{item.children.join(" · ")}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => setActive(identityGraph.foundation.id)}
              aria-pressed={active === identityGraph.foundation.id}
              className={cn(
                "mt-6 block border-t border-line pt-4 text-left text-base tracking-tight",
                active === identityGraph.foundation.id ? "text-accent" : "text-fg",
              )}
            >
              {identityGraph.foundation.label}
            </button>
            <p className="mt-6 max-w-[var(--read)] text-sm leading-relaxed text-muted md:text-base" aria-live="polite">
              {detail}
            </p>
            {skills ? (
              <p className="mt-3 text-sm text-subtle">{skills.items.map((item) => item.name).join(" · ")}</p>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
