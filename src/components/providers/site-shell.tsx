"use client";

import dynamic from "next/dynamic";
import { SiteProvider } from "./site-provider";
import { Navigation } from "@/components/nav/navigation";
import { CommandPalette } from "@/components/command/command-palette";
import { Cursor } from "@/components/cursor/cursor";
import { EasterEggs } from "@/components/easter/easter-eggs";
import { DepthSpot } from "@/components/spatial/depth-spot";
import { Hero } from "@/components/hero/hero";
import { Identity } from "@/components/identity/identity";
import { Skills } from "@/components/skills/skills";
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
import { useMotionEnabled } from "@/lib/use-motion-enabled";

const SpatialScene = dynamic(() => import("@/components/spatial/spatial-scene"), {
  ssr: false,
  loading: () => null,
});

function SpatialLayer() {
  const motionOn = useMotionEnabled();
  if (!motionOn) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <SpatialScene />
    </div>
  );
}

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
      <SmoothScroll />
      <SpatialLayer />
      <DepthSpot />
      <div className="grain" aria-hidden />
      <a
        href="#portfolio"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:px-4 focus:py-2 btn-solid"
      >
        Skip to portfolio
      </a>
      <Navigation />
      <main className="relative z-[1]">
        <Hero />
        <About />
        <Work />
        {github}
        {cursor}
        <Experience />
        <Skills />
        <Identity />
        <Architecture />
        <AiSection />
        <Philosophy />
        <Contact />
      </main>
      <footer className="relative z-[1] border-t border-line px-4 py-10 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted">
            {profile.name} · {profile.title}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-fg">
            <a href={`mailto:${profile.email}`} className="link-underline" data-cursor="external">
              {profile.email}
            </a>
            <a href={social.calendly} className="link-underline" data-cursor="external">
              Calendly
            </a>
            <a href={social.whatsapp} className="link-underline" data-cursor="external">
              WhatsApp
            </a>
            <a href={social.linkedin} className="link-underline" data-cursor="external">
              LinkedIn
            </a>
            <a href={social.medium} className="link-underline" data-cursor="external">
              Blogs
            </a>
            <a href={social.upwork} className="link-underline" data-cursor="external">
              Upwork
            </a>
            <a href={social.github} className="link-underline" data-cursor="external">
              GitHub
            </a>
            <a href="/privacy" className="link-underline">
              Privacy
            </a>
            <a href="/terms" className="link-underline">
              Terms
            </a>
          </div>
        </div>
      </footer>
      <CommandPalette />
      <ConnectFab />
      <Cursor />
      <EasterEggs />
    </SiteProvider>
  );
}
