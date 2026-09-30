"use client";

import { useState } from "react";
import { Calendar, Copy, FileText, Mail, PenLine } from "lucide-react";
import { Container, Section } from "@/components/ui/section";
import { GitHubIcon, LinkedInIcon, UpworkIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
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
    { id: "email", label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: Mail },
    { id: "whatsapp", label: "WhatsApp", value: hostLabel(social.whatsapp), href: social.whatsapp, icon: WhatsAppIcon },
    { id: "calendly", label: "Calendly", value: hostLabel(social.calendly), href: social.calendly, icon: Calendar },
    { id: "upwork", label: "Upwork", value: hostLabel(social.upwork), href: social.upwork, icon: UpworkIcon },
    { id: "linkedin", label: "LinkedIn", value: hostLabel(social.linkedin), href: social.linkedin, icon: LinkedInIcon },
    { id: "github", label: "GitHub", value: hostLabel(social.github), href: social.github, icon: GitHubIcon },
    { id: "medium", label: "Blogs", value: hostLabel(social.medium), href: "/blog", icon: PenLine },
    { id: "resume", label: "Resume", value: "Resume", href: profile.resumeUrl, icon: FileText },
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
                  className="group grid grid-cols-[1.25rem_6.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-4"
                >
                  <channel.icon className="h-4 w-4 text-accent" />
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
            <button type="button" onClick={copyEmail} className="ctrl mt-6 inline-flex items-center gap-1.5 text-muted">
              <Copy className="h-3.5 w-3.5" aria-hidden />
              {copied ? "Email copied" : "Copy email"}
            </button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
