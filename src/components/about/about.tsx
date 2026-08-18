"use client";

import { Container, Section, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useContent } from "@/components/providers/content-provider";

export function About() {
  const { profile, social } = useContent();
  return (
    <Section id="about">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Eyebrow>About</Eyebrow>
            <h2 className="mt-5 font-serif text-[1.85rem] leading-[1.08] md:text-5xl">
              {profile.aboutHeadline}
            </h2>
          </div>
          <Reveal>
            <p className="text-lg leading-relaxed text-muted md:text-xl">{profile.aboutBody}</p>
            <dl className="mt-10 grid gap-8 sm:grid-cols-3">
              <div>
                <dt className="font-mono text-[11px] tracking-[0.2em] text-subtle uppercase">
                  Based
                </dt>
                <dd className="mt-2 text-fg">{profile.location}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] tracking-[0.2em] text-subtle uppercase">
                  Available
                </dt>
                <dd className="mt-2 text-fg">{profile.availability}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] tracking-[0.2em] text-subtle uppercase">
                  Focus
                </dt>
                <dd className="mt-2 text-fg">{profile.focus[0]}</dd>
              </div>
            </dl>
            <p className="mt-10 text-sm text-muted">
              <a href={social.github} className="link-underline text-fg" data-cursor="external">
                GitHub
              </a>
              {"  ·  "}
              <a href={social.linkedin} className="link-underline text-fg" data-cursor="external">
                LinkedIn
              </a>
              {"  ·  "}
              <a href={social.medium} className="link-underline text-fg" data-cursor="external">
                Blogs
              </a>
            </p>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
