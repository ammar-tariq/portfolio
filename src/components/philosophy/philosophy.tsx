"use client";

import { Container, Section } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { dossierEntry } from "@/lib/dossier";

export function Philosophy() {
  const { principles } = useContent();
  const entry = dossierEntry("philosophy");
  return (
    <Section id="philosophy">
      <Container>
        <div className="axis-grid mb-10">
          <p className="meta-label axis-side mb-4 sm:mb-0 sm:pt-1">
            <span className="block text-accent">{entry?.marker}</span>
            <span className="mt-1 block">{entry?.label}</span>
          </p>
          <h2 className="axis-main max-w-[20ch] text-[clamp(1.7rem,3vw,2.7rem)] leading-[1.05] font-medium tracking-[-0.03em]">
            How I decide what to build — and what to refuse.
          </h2>
        </div>
        <div className="border-t border-line">
          {principles.map((item, index) => (
            <article
              key={item.id}
              className="axis-grid border-b border-line py-8 md:py-10"
            >
              <p className="meta-label axis-side mb-3 text-accent min-[1100px]:mb-0">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className="axis-main grid gap-4 min-[900px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] min-[900px]:gap-10">
                <div>
                  <h3 className="text-xl tracking-tight md:text-2xl">{item.title}</h3>
                  <p className="mt-3 font-serif text-lg leading-snug text-fg md:text-xl">{item.statement}</p>
                </div>
                <p className="max-w-[var(--read)] text-sm leading-relaxed text-muted md:text-base">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
