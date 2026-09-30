"use client";

import { useState } from "react";
import { Container, Section, SectionIntro } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { dossierEntry } from "@/lib/dossier";
import { cn } from "@/lib/cn";

export function AiSection() {
  const { architecture } = useContent();
  const aiPipeline = architecture.aiPipeline;
  const aiConcepts = architecture.aiConcepts;
  const entry = dossierEntry("ai");
  const [step, setStep] = useState(aiPipeline[2]?.id ?? aiPipeline[0]?.id ?? "");
  const [concept, setConcept] = useState(aiConcepts[0]?.id ?? "");
  const [engaged, setEngaged] = useState(false);
  const currentStep = aiPipeline.find((item) => item.id === step) ?? aiPipeline[0];
  const currentConcept = aiConcepts.find((item) => item.id === concept) ?? aiConcepts[0];
  if (!currentStep || !currentConcept) return null;

  return (
    <Section id="ai">
      <Container>
        <SectionIntro
          marker={entry?.marker ?? "07"}
          label={entry?.label ?? "AI"}
          title="Models are components. Products are the system."
          kicker="A real pipeline — user, product, orchestration, model, tools, result."
        />
        <div className="axis-grid">
          <div className="axis-side max-[719px]:hidden" />
          <div className="axis-main">
            <ol
              className={cn("ai-flow flex flex-col border-l border-line min-[800px]:flex-row min-[800px]:flex-wrap min-[800px]:items-center min-[800px]:gap-y-3 min-[800px]:border-l-0", engaged && "is-engaged")}
              onMouseLeave={() => setEngaged(false)}
            >
              {aiPipeline.map((item, index) => {
                const on = step === item.id;
                return (
                  <li key={item.id} className="flex items-center">
                    <button
                      type="button"
                      className={cn(
                        "ai-node py-2 pl-4 text-left text-sm tracking-tight transition-opacity duration-[var(--dur)] min-[800px]:px-3 min-[800px]:py-1",
                        on ? "is-on text-accent" : "text-fg hover:text-accent",
                      )}
                      aria-pressed={on}
                      onMouseEnter={() => {
                        setStep(item.id);
                        setEngaged(true);
                      }}
                      onFocus={() => {
                        setStep(item.id);
                        setEngaged(true);
                      }}
                      onClick={() => setStep(item.id)}
                    >
                      {item.label}
                    </button>
                    {index < aiPipeline.length - 1 ? (
                      <span className="hidden px-1 text-subtle min-[800px]:inline" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 max-w-[var(--read)] min-h-[3.25rem] text-sm leading-relaxed text-muted md:text-base" aria-live="polite">
              {currentStep.detail}
            </p>
            <div className="mt-10 border-t border-line">
              {aiConcepts.map((item) => {
                const on = concept === item.id;
                return (
                  <div key={item.id} className="border-b border-line">
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-baseline justify-between gap-6 py-3 text-left text-sm",
                        on ? "text-accent" : "text-fg",
                      )}
                      aria-expanded={on}
                      onClick={() => setConcept(item.id)}
                    >
                      <span>{item.label}</span>
                      <span className="meta-label">{on ? "Open" : "Note"}</span>
                    </button>
                    {on ? <p className="max-w-[var(--read)] pb-4 text-sm leading-relaxed text-muted">{item.body}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
