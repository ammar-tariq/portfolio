"use client";

import { Container, Section, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useContent } from "@/components/providers/content-provider";

export function Philosophy() {
  const { principles } = useContent();
  return (
    <Section id="philosophy">
      <Container>
        <div className="mb-16 max-w-2xl">
          <Eyebrow>Engineering philosophy</Eyebrow>
          <h2 className="mt-5 font-serif text-[1.85rem] leading-[1.08] md:text-5xl lg:text-[3.4rem]">
            How I decide what to build — and what to refuse.
          </h2>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {principles.map((item, index) => (
            <Reveal key={item.id}>
              <article className="group grid gap-4 py-10 md:grid-cols-[0.28fr_1.2fr_0.9fr] md:items-baseline md:gap-8 md:py-14">
                <p className="font-mono text-[11px] tracking-[0.24em] text-subtle">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="font-serif text-2xl tracking-tight text-fg md:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-serif text-xl text-accent md:text-3xl">
                    {item.statement}
                  </p>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-muted md:text-base">
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
