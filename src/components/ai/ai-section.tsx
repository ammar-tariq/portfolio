"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { DiagramFrame, DiagramNode } from "@/components/ui/diagram";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { useContent } from "@/components/providers/content-provider";

export function AiSection() {
  const { architecture } = useContent();
  const aiPipeline = architecture.aiPipeline;
  const aiConcepts = architecture.aiConcepts;
  const [step, setStep] = useState<string>(aiPipeline[2]?.id ?? aiPipeline[0]?.id ?? "");
  const [concept, setConcept] = useState<string>(aiConcepts[0]?.id ?? "");
  const currentStep = aiPipeline.find((item) => item.id === step) ?? aiPipeline[0];
  const currentConcept = aiConcepts.find((item) => item.id === concept) ?? aiConcepts[0];
  if (!currentStep || !currentConcept) return null;

  return (
    <Section id="ai">
      <Container>
        <SectionHeader
          eyebrow="AI systems"
          title="Models are components. Products are the system."
          kicker="A real pipeline — user, product, orchestration, model, tools, result."
        />
        <Reveal>
          <DiagramFrame>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-2">
              {aiPipeline.map((item, index) => (
                <div key={item.id} className="flex min-w-0 w-full items-center gap-2 sm:w-auto">
                  <DiagramNode
                    id={item.id}
                    label={item.label}
                    active={step === item.id}
                    onSelect={setStep}
                    className="w-full sm:w-auto"
                  />
                  {index < aiPipeline.length - 1 ? (
                    <span className="hidden h-px w-6 shrink-0 bg-linear-to-r from-line-strong to-accent/50 sm:block" />
                  ) : null}
                </div>
              ))}
            </div>
            <motion.p
              key={currentStep.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-muted md:text-base"
            >
              {currentStep.detail}
            </motion.p>
          </DiagramFrame>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {aiConcepts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setConcept(item.id)}
                data-cursor="link"
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left text-sm tracking-tight transition-all",
                  concept === item.id
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-bg-elevated/40 text-muted hover:text-fg",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <motion.p
            key={currentConcept.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 max-w-2xl text-sm leading-relaxed text-muted md:text-base"
          >
            {currentConcept.body}
          </motion.p>
        </Reveal>
      </Container>
    </Section>
  );
}
