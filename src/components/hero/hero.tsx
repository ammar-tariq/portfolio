"use client";

import { useContent } from "@/components/providers/content-provider";
import { Container } from "@/components/ui/section";
import { dossierEntry } from "@/lib/dossier";
import { handleHomeSectionClick } from "@/lib/section-nav";

export function Hero() {
  const { profile } = useContent();
  const marker = dossierEntry("hero");

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100dvh-var(--header)-env(safe-area-inset-top,0px))] flex-col justify-center"
    >
      <Container className="w-full py-12">
        <div className="axis-grid">
          <p className="meta-label axis-side mb-6 sm:mb-0 sm:pt-2">
            <span className="settle block text-accent">{marker?.marker}</span>
            <span className="settle settle-2 mt-1 block">{marker?.label}</span>
          </p>
          <div className="axis-main">
            <h1 className="hero-name settle settle-2 text-fg">
              <span className="block">{profile.firstName}</span>
              <span className="block">{profile.lastName}</span>
            </h1>
            <p className="meta-label settle settle-3 mt-5 text-fg">{profile.title}</p>
            <p className="settle settle-4 mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
              {profile.headline}
            </p>
            <div className="settle settle-5 mt-7 flex flex-wrap gap-x-6 gap-y-3">
              <a href="/portfolio" className="ctrl" onClick={(event) => handleHomeSectionClick(event, "/portfolio")}>
                Selected work
              </a>
              <a href="/contact" className="ctrl" onClick={(event) => handleHomeSectionClick(event, "/contact")}>
                Contact
              </a>
              <a href={profile.resumeUrl} className="ctrl">
                Resume
              </a>
            </div>
            <dl className="settle settle-5 mt-10 grid gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <Meta term="Location" value={profile.location} />
              <Meta term="Practice" value={`${profile.yearsExperience}+ years`} />
              <Meta term="Availability" value={profile.availability} />
              <div>
                <dt className="meta-label">Focus</dt>
                <dd className="mt-1 text-sm leading-snug text-fg">{profile.focus.join(" · ")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Meta({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="meta-label">{term}</dt>
      <dd className="mt-1 text-sm leading-snug text-fg">{value}</dd>
    </div>
  );
}
