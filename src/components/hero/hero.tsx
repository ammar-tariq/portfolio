"use client";

import Link from "next/link";
import { ArrowUpRight, FileText, Mail, MapPin, Radio, Timer } from "lucide-react";
import { useContent } from "@/components/providers/content-provider";
import { Container } from "@/components/ui/section";
import { RemoteImage } from "@/components/ui/remote-image";
import { dossierEntry } from "@/lib/dossier";
import { featuredProjects } from "@/lib/project-helpers";
import { coverImage } from "@/lib/project-media";
import { handleHomeSectionClick } from "@/lib/section-nav";

export function Hero() {
  const { profile, projects } = useContent();
  const marker = dossierEntry("hero");
  const frames = featuredProjects(projects)
    .map((project) => ({ project, src: coverImage(project) }))
    .filter((item): item is { project: (typeof projects)[number]; src: string } => Boolean(item.src))
    .slice(0, 4);

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100dvh-var(--header)-env(safe-area-inset-top,0px))] flex-col justify-center overflow-hidden"
    >
      <div className="hero-wash" aria-hidden />
      <Container className="relative w-full py-12">
        <div className="axis-grid">
          <p className="meta-label axis-side mb-6 sm:mb-0 sm:pt-2">
            <span className="settle block text-accent">{marker?.marker}</span>
            <span className="settle settle-2 mt-1 block">{marker?.label}</span>
          </p>
          <div className="axis-main">
            <div className="grid items-end gap-10 xl:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <h1 className="hero-name settle settle-2">
                  <span className="block">{profile.firstName}</span>
                  <span className="block">{profile.lastName}</span>
                </h1>
                <p className="meta-label settle settle-3 mt-5 text-fg">{profile.title}</p>
                <p className="settle settle-4 mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
                  {profile.headline}
                </p>
                <div className="settle settle-5 mt-7 flex flex-wrap gap-x-6 gap-y-3">
                  <Link href="/portfolio" scroll={false} className="ctrl" onClick={(event) => handleHomeSectionClick(event, "/portfolio")}>
                    Selected work
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <Link href="/contact" scroll={false} className="ctrl" onClick={(event) => handleHomeSectionClick(event, "/contact")}>
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    Contact
                  </Link>
                  <a href={profile.resumeUrl} className="ctrl">
                    <FileText className="h-3.5 w-3.5" aria-hidden />
                    Resume
                  </a>
                </div>
              </div>
              {frames.length ? (
                <div className="settle settle-4 relative mx-auto h-56 w-full max-w-[22rem] shrink-0 sm:h-64 xl:mx-0 xl:w-[22rem]">
                  {frames.map(({ project, src }, index) => (
                    <Link
                      key={project.slug}
                      href={`/work/${project.slug}`}
                      className="absolute top-2 h-48 w-[5.75rem] overflow-hidden border border-line sm:h-56 sm:w-28"
                      style={{
                        left: `${index * 22}%`,
                        transform: `rotate(${[-3, -1, 1, 3][index] ?? 0}deg)`,
                        zIndex: index === 1 ? 3 : index,
                      }}
                    >
                      <span className="relative block h-full w-full">
                        <RemoteImage
                          src={src}
                          alt=""
                          fill
                          sizes="112px"
                          className="object-cover object-top"
                        />
                      </span>
                      <span className="sr-only">{project.title}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <dl className="settle settle-5 mt-10 grid gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <Meta icon={MapPin} term="Location" value={profile.location} />
              <Meta icon={Timer} term="Practice" value={`${profile.yearsExperience}+ years`} />
              <Meta icon={Radio} term="Availability" value={profile.availability} />
              <div className="min-w-0">
                <dt className="meta-label inline-flex items-center gap-1.5">
                  <ArrowUpRight className="h-3 w-3 text-accent" aria-hidden />
                  Focus
                </dt>
                <dd className="mt-1 text-sm leading-snug text-fg">{profile.focus.join(" · ")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Meta({
  icon: Icon,
  term,
  value,
}: {
  icon: typeof MapPin;
  term: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="meta-label inline-flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-accent" aria-hidden />
        {term}
      </dt>
      <dd className="mt-1 text-sm leading-snug text-fg">{value}</dd>
    </div>
  );
}
