"use client";

import { Container, Section } from "@/components/ui/section";
import { RemoteImage } from "@/components/ui/remote-image";
import { useContent } from "@/components/providers/content-provider";
import { siteFaq } from "@/lib/faq";
import { profilePhotoSrc } from "@/lib/media-url";
import { dossierEntry } from "@/lib/dossier";
import Link from "next/link";

export function About() {
  const content = useContent();
  const { profile, social, navItems } = content;
  const faq = siteFaq(content);
  const photo = profilePhotoSrc(profile, social);
  const entry = dossierEntry("about");
  const label = navItems.find((item) => item.id === "about")?.label ?? entry?.label ?? "About";

  return (
    <Section id="about">
      <Container>
        <div className="axis-grid">
          <p className="meta-label axis-side mb-4 sm:mb-0 sm:pt-1">
            <span className="block text-accent">{entry?.marker}</span>
            <span className="mt-1 block">{label}</span>
          </p>
          <div className="axis-main">
            <div className="grid gap-8 min-[900px]:grid-cols-[minmax(0,1fr)_9rem] min-[900px]:items-start">
              <div>
                <h2 className="font-serif text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.15] tracking-[-0.02em] text-fg">
                  {profile.aboutHeadline}
                </h2>
                <p className="mt-6 max-w-[var(--read)] text-base leading-relaxed text-muted md:text-lg">
                  {profile.aboutBody}
                </p>
              </div>
              {photo ? (
                <figure className="relative aspect-[3/4] w-28 overflow-hidden border border-line min-[900px]:w-full">
                  <RemoteImage
                    src={photo}
                    alt={profile.name}
                    fill
                    sizes="144px"
                    className="object-cover object-[center_20%] grayscale"
                  />
                </figure>
              ) : null}
            </div>
            <dl className="mt-10 grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
              <div>
                <dt className="meta-label">Based</dt>
                <dd className="mt-2 text-sm text-fg">{profile.location}</dd>
              </div>
              <div>
                <dt className="meta-label">Available</dt>
                <dd className="mt-2 text-sm text-fg">{profile.availability}</dd>
              </div>
              <div>
                <dt className="meta-label">Focus</dt>
                <dd className="mt-2 text-sm text-fg">{profile.focus[0]}</dd>
              </div>
            </dl>
            <p className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a href={social.github} className="link-underline" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href={social.linkedin} className="link-underline" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <Link href="/blog" className="link-underline">
                Blogs
              </Link>
              <Link href="/resume" className="link-underline">
                Resume
              </Link>
            </p>
          </div>
        </div>
        <div className="axis-grid mt-16" id="faq">
          <p className="meta-label axis-side mb-4 text-accent min-[1100px]:mb-0">FAQ</p>
          <dl className="axis-main border-t border-line">
            {faq.map((item) => (
              <div key={item.question} className="grid gap-2 border-b border-line py-5 min-[800px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] min-[800px]:gap-8">
                <dt className="text-sm text-fg">{item.question}</dt>
                <dd className="text-sm leading-relaxed text-muted">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}
