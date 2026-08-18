"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useContent } from "@/components/providers/content-provider";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { useMotionEnabled } from "@/lib/use-motion-enabled";
import { useIsDesktop, useIsFinePointer } from "@/lib/use-media-query";

export function Hero() {
  const { profile } = useContent();
  const sectionRef = useRef<HTMLElement>(null);
  const fine = useIsFinePointer();
  const desktop = useIsDesktop();
  const motionOn = useMotionEnabled();
  const x1 = useSpring(0, { stiffness: 120, damping: 22, mass: 0.8 });
  const y1 = useSpring(0, { stiffness: 120, damping: 22, mass: 0.8 });
  const x2 = useSpring(0, { stiffness: 90, damping: 22, mass: 1 });
  const y2 = useSpring(0, { stiffness: 90, damping: 22, mass: 1 });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const driftY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const fade = useTransform(scrollYProgress, [0, 0.68], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[80dvh] overflow-x-clip pt-8 md:overflow-hidden md:min-h-[88dvh]"
      onPointerMove={(event) => {
        if (!fine || !motionOn) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        x1.set(nx * -10);
        y1.set(ny * -6);
        x2.set(nx * -22);
        y2.set(ny * -12);
      }}
      onPointerLeave={() => {
        x1.set(0);
        y1.set(0);
        x2.set(0);
        y2.set(0);
      }}
    >
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <motion.div
        className="relative z-10"
        style={motionOn && desktop ? { y: driftY, opacity: fade, scale } : undefined}
      >
        <Container className="flex min-h-[calc(100dvh-6rem)] flex-col justify-center pb-28 md:pb-24">
          <p className="mb-5 font-mono text-[11px] tracking-[0.28em] text-accent uppercase">
            {profile.title}
          </p>
          <h1 className="max-w-3xl" style={{ perspective: "1200px" }}>
            <span className="sr-only">{profile.name}</span>
            <motion.span
              aria-hidden
              style={{ x: x1, y: y1 }}
              className="block text-[clamp(2.8rem,10vw,8rem)] leading-[0.86] font-medium tracking-[-0.055em] text-fg will-change-transform"
            >
              {profile.firstName}
            </motion.span>
            <motion.span
              aria-hidden
              style={{ x: x2, y: y2 }}
              className="mt-1 block font-serif text-[clamp(3.2rem,12vw,8.6rem)] leading-[0.88] text-fg will-change-transform"
            >
              {profile.lastName}
            </motion.span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
            {profile.headline}
          </p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted md:text-base">
            <span className="text-fg">{profile.name}</span> is a personal portfolio website. Its
            purpose is to present {profile.name}’s software engineering work — selected products,
            case studies, and contact details — so clients and hiring teams can review that work and
            get in touch. The site is public to browse. There is no visitor signup or consumer
            account.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="#portfolio">View portfolio</ButtonLink>
            <ButtonLink href="#contact" variant="ghost">
              Contact
            </ButtonLink>
          </div>
          <div className="mt-16 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] tracking-[0.2em] text-subtle uppercase">
            <span>{profile.location}</span>
            <span>{profile.yearsExperience}+ years</span>
            <span>{profile.availability}</span>
          </div>
        </Container>
      </motion.div>
      <div className="absolute right-8 bottom-8 hidden font-mono text-[10px] tracking-[0.22em] text-subtle uppercase md:block">
        Scroll
      </div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 hidden h-16 w-px -translate-x-1/2 bg-linear-to-b from-transparent to-accent/50 md:block" />
    </section>
  );
}
