"use client";

import Link from "next/link";
import { Calendar, FileText, PenLine, Scale } from "lucide-react";
import { GitHubIcon, LinkedInIcon, UpworkIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { SiteProvider } from "./site-provider";
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
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { useContent } from "@/components/providers/content-provider";
import { HomeSectionSync } from "@/components/nav/home-section-sync";
import { handleHomeSectionClick } from "@/lib/section-nav";

export function SiteShell({
  github,
  cursor,
}: {
  github: React.ReactNode;
  cursor?: React.ReactNode;
}) {
  const { profile, social } = useContent();
  return (
    <SiteProvider>
      <SkillFocusProvider>
        <SmoothScroll />
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
            {github}
            {cursor}
            <About />
            <Philosophy />
            <Contact />
          </main>
          <footer className="relative border-t border-line px-[var(--page-x)] py-10 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
            <div className="axis-grid gap-4">
              <div className="axis-main">
                <p className="text-sm tracking-tight">{profile.name}</p>
                <p className="mt-1 text-sm text-muted">{profile.title}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                  <a href={`mailto:${profile.email}`} className="link-underline" data-cursor="external">
                    {profile.email}
                  </a>
                  <a href={social.calendly} className="inline-flex items-center gap-1.5 link-underline" target="_blank" rel="noopener noreferrer">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    Calendly
                  </a>
                  <a href={social.whatsapp} className="inline-flex items-center gap-1.5 link-underline" target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                  <a href={social.linkedin} className="inline-flex items-center gap-1.5 link-underline" target="_blank" rel="noopener noreferrer">
                    <LinkedInIcon className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                  <Link href="/blog" className="inline-flex items-center gap-1.5 link-underline">
                    <PenLine className="h-3.5 w-3.5" aria-hidden />
                    Blogs
                  </Link>
                  <a href={social.upwork} className="inline-flex items-center gap-1.5 link-underline" target="_blank" rel="noopener noreferrer">
                    <UpworkIcon className="h-3.5 w-3.5" />
                    Upwork
                  </a>
                  <a href={social.github} className="inline-flex items-center gap-1.5 link-underline" target="_blank" rel="noopener noreferrer">
                    <GitHubIcon className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                  <Link href="/resume" className="inline-flex items-center gap-1.5 link-underline">
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
          </footer>
        </div>
        <CommandPalette />
        <ConnectFab />
        <EasterEggs />
      </SkillFocusProvider>
    </SiteProvider>
  );
}
