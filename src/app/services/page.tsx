import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Container } from "@/components/ui/section";
import { BrandMark } from "@/components/ui/brand-mark";
import { JsonLd } from "@/components/seo/json-ld";
import { routeMetadata, servicesPageJsonLd } from "@/lib/seo";
import { getSiteContent } from "@/lib/content";
import { SERVICE_DEFINITIONS, projectsForService } from "@/lib/services";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return routeMetadata(content, {
    title: "Services",
    description: `${content.profile.name} builds React Native, React, Node.js, and TypeScript products from ${content.profile.location}. Remote worldwide, freelance, on-site in Pakistan, and relocation when visa support is provided.`,
    path: "/services",
    ogTitle: `Services — ${content.profile.name}`,
    keywords: [
      content.profile.name,
      "React Native development",
      "React development",
      "Node.js development",
      "full-stack software engineer",
      "remote software engineer",
      "freelance software engineer",
    ],
  });
}

export default async function ServicesPage() {
  const content = await getSiteContent();
  const { profile } = content;

  return (
    <div className="min-h-svh bg-bg pb-24 text-fg">
      <JsonLd data={servicesPageJsonLd(content)} />
      <Container className="relative pt-[max(4rem,calc(env(safe-area-inset-top)+1.25rem))]">
        <div className="hero-wash" aria-hidden />
        <Link href="/" className="glass-quiet relative z-[1] inline-flex items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1 text-sm text-muted hover:text-fg">
          <BrandMark className="h-8 w-8" name={profile.name} />
          <span>{profile.name}</span>
        </Link>
        <header className="relative z-[1] mt-10 max-w-2xl">
          <p className="meta-label inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
            {profile.location}
          </p>
          <h1 className="settle mt-4 text-[clamp(1.85rem,4vw,3.4rem)] leading-[1.02] font-medium tracking-[-0.03em]">
            Services
          </h1>
          <p className="settle settle-3 mt-4 text-lg text-muted">{profile.summary}</p>
          <p className="mt-4 text-sm text-muted">{profile.availability}.</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/contact" className="ctrl">
              Contact {profile.firstName}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link href="/work" className="ctrl">
              Projects
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link href="/experience" className="ctrl">
              Experience
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </header>

        <div className="relative z-[1] mt-16 space-y-16">
          {SERVICE_DEFINITIONS.map((service) => {
            const projects = projectsForService(content.projects, service);
            return (
              <section key={service.id} id={service.id} className="scroll-mt-28 border-t border-line pt-10">
                <h2 className="max-w-[20ch] text-[clamp(1.5rem,3vw,2.2rem)] leading-tight font-medium tracking-[-0.03em]">
                  {service.title}
                </h2>
                <p className="mt-4 max-w-2xl text-muted">{service.summary}</p>
                {projects.length ? (
                  <ul className="mt-6 max-w-2xl divide-y divide-line border-y border-line">
                    {projects.map((project) => (
                      <li key={project.slug}>
                        <Link href={`/work/${project.slug}`} className="group flex items-baseline justify-between gap-4 py-3">
                          <span>
                            <span className="text-fg group-hover:text-accent">{project.seoLabel}</span>
                            <span className="mt-1 block text-sm text-muted">{project.tagline}</span>
                          </span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-sm text-muted">
                    No public case study lists this stack yet.{" "}
                    <Link href="/ai" className="link-underline text-fg">
                      AI systems
                    </Link>{" "}
                    describes the approach.
                  </p>
                )}
              </section>
            );
          })}

          <section id="availability" className="scroll-mt-28 border-t border-line pt-10">
            <h2 className="max-w-[20ch] text-[clamp(1.5rem,3vw,2.2rem)] leading-tight font-medium tracking-[-0.03em]">
              Remote, freelance, and on-site
            </h2>
            <ul className="mt-5 max-w-2xl space-y-3 text-muted">
              <li>Full-time remote employment, worldwide.</li>
              <li>Freelance and project-based work, worldwide.</li>
              <li>On-site work in Pakistan. {profile.name} is based in {profile.location}.</li>
              <li>International on-site work only when the employer provides relocation or visa support. This site does not claim authorization to work outside Pakistan.</li>
            </ul>
            <p className="mt-6 text-sm text-muted">
              <Link href="/skills" className="link-underline text-fg">
                Skills
              </Link>
              {" · "}
              <Link href="/resume" className="link-underline text-fg">
                Resume
              </Link>
              {" · "}
              <Link href="/contact" className="link-underline text-fg">
                Contact
              </Link>
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
