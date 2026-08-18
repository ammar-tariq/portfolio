"use client";

import { useState } from "react";
import { ArrowUpRight, Calendar, Check, Copy, Mail, MapPin } from "lucide-react";
import { Container, Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { useContent } from "@/components/providers/content-provider";

function MediumIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M4.07 7.26a.4.4 0 0 0-.13-.34L2.3 4.86V4.5h5.66l4.38 9.62 3.85-9.62h5.4v.36l-1.56 1.5a.24.24 0 0 0-.09.23v11.7a.24.24 0 0 0 .09.23l1.52 1.5v.36h-7.64v-.36l1.58-1.53c.15-.15.15-.2.15-.23V8.36l-4.4 11.18h-.6L6.08 8.36v7.5c-.04.3.06.61.27.83l2.05 2.49v.36H2.1v-.36l2.05-2.49c.2-.22.3-.53.26-.83V7.26Z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.04 1.53 1.04.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 6.8c.85 0 1.7.11 2.5.32 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35ZM12.04 21.8h-.01A9.8 9.8 0 0 1 7.2 20.4L3 21.52l1.15-4.1a9.8 9.8 0 0 1-1.5-5.27C2.65 6.73 6.86 2.52 12.04 2.52c2.47 0 4.8.97 6.55 2.72A9.18 9.18 0 0 1 21.35 12.2c0 5.18-4.21 9.6-9.31 9.6Zm8.3-19.1A11.64 11.64 0 0 0 12.04 0C5.48 0 .15 5.33.16 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.87 11.87 0 0 0 5.73 1.46h.01c6.56 0 11.89-5.33 11.9-11.9 0-3.18-1.24-6.17-3.5-8.41Z" />
    </svg>
  );
}

function UpworkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.56 8.22a5.6 5.6 0 0 0-5.4 4.07 8.8 8.8 0 0 0-.7-1.58c-.74-1.35-1.4-2.77-2.42-3.9A4.4 4.4 0 0 0 6.8 5.4 4.47 4.47 0 0 0 2.3 9.9c0 .3.03.6.08.9H4.5a2.36 2.36 0 0 1 4.7 0c.4 2.26 1.74 4.35 2.8 6.5H7.5v2.15h9.07v-2.15h-2.3c-.7-1.48-1.46-3.1-1.9-4.7a3.5 3.5 0 0 1 3.4-2.73 2.6 2.6 0 0 1 2.64 2.7c0 2.5-1.56 4.55-3.7 4.55v2.16c3.36 0 5.9-2.76 5.9-6.7a4.63 4.63 0 0 0-4.85-5.11Z" />
    </svg>
  );
}

function hostLabel(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function Contact() {
  const { profile, social } = useContent();
  const [copied, setCopied] = useState(false);
  const channels = [
    { id: "email", label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: Mail },
    { id: "whatsapp", label: "WhatsApp", value: hostLabel(social.whatsapp), href: social.whatsapp, icon: WhatsAppIcon },
    { id: "calendly", label: "Calendly", value: hostLabel(social.calendly), href: social.calendly, icon: Calendar },
    { id: "upwork", label: "Upwork", value: hostLabel(social.upwork), href: social.upwork, icon: UpworkIcon },
    { id: "linkedin", label: "LinkedIn", value: hostLabel(social.linkedin), href: social.linkedin, icon: LinkedInIcon },
    { id: "github", label: "GitHub", value: hostLabel(social.github), href: social.github, icon: GitHubIcon },
    { id: "medium", label: "Blogs", value: hostLabel(social.medium), href: social.medium, icon: MediumIcon },
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
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.24em] text-accent uppercase">
            Contact
          </p>
          <h2 className="mt-6 max-w-3xl font-serif text-[1.85rem] leading-[1.05] text-fg sm:text-5xl md:text-7xl">
            Have a difficult engineering problem?
          </h2>
          <p className="mt-6 max-w-xl text-xl text-fg/80">Let&apos;s build it.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={`mailto:${profile.email}`}>Email me</ButtonLink>
            <ButtonLink href={social.whatsapp} variant="ghost">
              WhatsApp
            </ButtonLink>
            <ButtonLink href={social.calendly} variant="ghost">
              Book a meeting
            </ButtonLink>
            <ButtonLink href={social.linkedin} variant="ghost">
              LinkedIn
            </ButtonLink>
            <ButtonLink href={social.upwork} variant="ghost">
              Upwork
            </ButtonLink>
            <ButtonLink href={profile.resumeUrl} variant="ghost">
              Resume
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-16 divide-y divide-line border-y border-line">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
                key={channel.id}
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                data-cursor={channel.href.startsWith("http") ? "external" : "link"}
                className="group flex min-w-0 items-start gap-3 py-5 md:grid md:grid-cols-[140px_1fr_auto] md:items-center md:gap-4 md:py-6"
              >
                <span className="hidden items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-subtle uppercase md:inline-flex">
                  <Icon className="h-3.5 w-3.5 text-accent" />
                  {channel.label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-subtle uppercase md:hidden">
                    <Icon className="h-3.5 w-3.5 text-accent" />
                    {channel.label}
                  </span>
                  <span className="block truncate font-serif text-lg tracking-tight text-fg md:text-2xl">
                    {channel.value}
                  </span>
                </span>
                <ArrowUpRight className="mt-5 h-4 w-4 shrink-0 text-muted group-hover:text-accent md:mt-0" />
              </a>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex flex-wrap items-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4 text-accent" />
            {profile.location} · {profile.availability}
          </p>
          <button
            type="button"
            onClick={copyEmail}
            className="inline-flex items-center gap-2 self-start rounded-full border border-line px-4 py-2 text-sm text-fg hover:border-accent"
            data-cursor="link"
          >
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4 text-accent" />}
            {copied ? "Email copied" : "Copy email"}
          </button>
        </div>
      </Container>
    </Section>
  );
}
