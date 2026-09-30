"use client";

import Link from "next/link";
import { Calendar, FileText, FolderKanban, PenLine, Scale } from "lucide-react";
import { GitHubIcon, LinkedInIcon, UpworkIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { Navigation } from "@/components/nav/navigation";
import { CommandPalette } from "@/components/command/command-palette";
import { EasterEggs } from "@/components/easter/easter-eggs";
import { Hero } from "@/components/hero/hero";
import { Identity } from "@/components/identity/identity";
import { Skills } from "@/components/skills/skills";
import { SkillFocusProvider } from "@/components/skills/skill-focus";
import { Work } from "@/components/work/work";
import { Experience } from "@/components/experience/experience";
import { Philosophy } from "@/components/philosophy/philosophy";
import { Architecture } from "@/components/architecture/architecture";
import { AiSection } from "@/components/ai/ai-section";
import { About } from "@/components/about/about";
import { Contact } from "@/components/contact/contact";
import { ConnectFab } from "@/components/contact/connect-fab";
import { useContent } from "@/components/providers/content-provider";
import { Reveal } from "@/components/ui/reveal";
import { HomeSectionSync } from "@/components/nav/home-section-sync";
import { handleHomeSectionClick } from "@/lib/section-nav";
import { trackEvent } from "@/lib/analytics-events";

export function SiteShell({
  github,
  cursor,
}: {
  github: React.ReactNode;
  cursor?: React.ReactNode;
}) {
  const { profile, social } = useContent();
  return (
    <SkillFocusProvider>
        <HomeSectionSync />
        <Link
          href="/portfolio"
          scroll={false}
          onClick={(event) => handleHomeSectionClick(event, "/portfolio")}
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:bg-bg focus:px-3 focus:py-2 focus:text-sm"
        >
          Skip to portfolio
        </Link>
        <Navigation />
        <div className="site-frame">
          <main className="dossier">
            <Hero />
            <Work />
            <Experience />
            <Skills />
            <Identity />
            <Architecture />
            <AiSection />
            <Reveal>{github}</Reveal>
            <Reveal delay={0.08}>{cursor}</Reveal>
            <About />
            <Philosophy />
            <Contact />
          </main>
          <footer className="relative border-t border-line px-[var(--page-x)] py-10 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
            <Reveal>
            <div className="axis-grid gap-4">
              <div className="axis-main">
                <p className="text-sm tracking-tight">{profile.name}</p>
                <p className="mt-1 text-sm text-muted">{profile.title}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                  <a href={`mailto:${profile.email}`} className="link-underline" data-cursor="external" onClick={() => trackEvent("email_click", { method: "footer" })}>
                    {profile.email}
                  </a>
                  <a href={social.calendly} className="inline-flex items-center gap-1.5 link-underline" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("contact_click", { method: "calendly" })}>
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    Calendly
                  </a>
                  <a href={social.whatsapp} className="inline-flex items-center gap-1.5 link-underline" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("contact_click", { method: "whatsapp" })}>
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                  <a href={social.linkedin} className="inline-flex items-center gap-1.5 link-underline" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("linkedin_click", { method: "footer" })}>
                    <LinkedInIcon className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                  <Link href="/blog" className="inline-flex items-center gap-1.5 link-underline">
                    <PenLine className="h-3.5 w-3.5" aria-hidden />
                    Blogs
                  </Link>
                  <a href={social.upwork} className="inline-flex items-center gap-1.5 link-underline" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("contact_click", { method: "upwork" })}>
                    <UpworkIcon className="h-3.5 w-3.5" />
                    Upwork
                  </a>
                  <a href={social.github} className="inline-flex items-center gap-1.5 link-underline" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("github_click", { method: "footer" })}>
                    <GitHubIcon className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                  <Link href="/services" className="link-underline">
                    Services
                  </Link>
                  <Link href="/work" className="inline-flex items-center gap-1.5 link-underline">
                    <FolderKanban className="h-3.5 w-3.5" aria-hidden />
                    Projects
                  </Link>
                  <Link href="/resume" className="inline-flex items-center gap-1.5 link-underline" onClick={() => trackEvent("resume_click", { method: "footer" })}>
                    <FileText className="h-3.5 w-3.5" aria-hidden />
                    Resume
                  </Link>
                  <Link href="/privacy" className="inline-flex items-center gap-1.5 link-underline">
                    <Scale className="h-3.5 w-3.5" aria-hidden />
                    Privacy
                  </Link>
                  <Link href="/terms" className="link-underline">
                    Terms
                  </Link>
                </div>
              </div>
            </div>
            </Reveal>
          </footer>
        </div>
        <CommandPalette />
        <ConnectFab />
        <EasterEggs />
      </SkillFocusProvider>
  );
}
