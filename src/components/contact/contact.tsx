"use client";

import { useState } from "react";
import { Container, Section } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { dossierEntry } from "@/lib/dossier";

function hostLabel(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function Contact() {
  const { profile, social } = useContent();
  const entry = dossierEntry("contact");
  const [copied, setCopied] = useState(false);
  const channels = [
    { id: "email", label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { id: "whatsapp", label: "WhatsApp", value: hostLabel(social.whatsapp), href: social.whatsapp },
    { id: "calendly", label: "Calendly", value: hostLabel(social.calendly), href: social.calendly },
    { id: "upwork", label: "Upwork", value: hostLabel(social.upwork), href: social.upwork },
    { id: "linkedin", label: "LinkedIn", value: hostLabel(social.linkedin), href: social.linkedin },
    { id: "github", label: "GitHub", value: hostLabel(social.github), href: social.github },
    { id: "medium", label: "Blogs", value: hostLabel(social.medium), href: "/blog" },
    { id: "resume", label: "Resume", value: "Resume", href: profile.resumeUrl },
  ] as const;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  }

  return (
    <Section id="contact">
      <Container>
        <div className="axis-grid">
          <p className="meta-label axis-side mb-4 sm:mb-0 sm:pt-1">
            <span className="block text-accent">{entry?.marker}</span>
            <span className="mt-1 block">{entry?.label}</span>
          </p>
          <div className="axis-main">
            <h2 className="max-w-[16ch] text-[clamp(2rem,4.2vw,3.6rem)] leading-[1.02] font-medium tracking-[-0.035em]">
              Have a difficult engineering problem?
            </h2>
            <p className="mt-5 text-lg text-muted">Let&apos;s build it.</p>
            <p className="meta-label mt-6">
              {profile.location}
              <span className="mx-2">·</span>
              {profile.availability}
            </p>
          </div>
        </div>
        <div className="axis-grid mt-12">
          <div className="axis-side max-[719px]:hidden" />
          <div className="axis-main border-t border-line">
            {channels.map((channel) => {
              const external = channel.href.startsWith("http");
              return (
                <a
                  key={channel.id}
                  href={channel.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  data-cursor={external ? "external" : "link"}
                  className="group grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-line py-4"
                >
                  <span className="meta-label">{channel.label}</span>
                  <span className="truncate text-base tracking-tight group-hover:text-accent md:text-lg">
                    {channel.value}
                  </span>
                  <span className="meta-label text-fg" aria-hidden>
                    →
                  </span>
                </a>
              );
            })}
            <button type="button" onClick={copyEmail} className="ctrl mt-6 text-muted">
              {copied ? "Email copied" : "Copy email"}
            </button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
