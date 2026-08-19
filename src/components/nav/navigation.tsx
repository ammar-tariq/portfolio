"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useContent } from "@/components/providers/content-provider";
import { useSite } from "@/components/providers/site-provider";
import { ThemeToggle } from "./theme-toggle";
import { BrandMark } from "@/components/ui/brand-mark";
import { useLenis } from "lenis/react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { easeOutExpo } from "@/lib/motion";
import { HOME_SECTIONS } from "@/lib/home-sections";
import { handleHomeSectionClick } from "@/lib/section-nav";

export function Navigation() {
  const { setCommandOpen } = useSite();
  const { navItems, social, profile } = useContent();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    const onScroll = () => {
      setCompact(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = HOME_SECTIONS.map((section) => section.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open, lenis]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-6"
        transition={{ duration: 0.45, ease: easeOutExpo }}
      >
        <nav
          aria-label="Primary"
          className={cn(
            "flex w-full max-w-6xl items-center justify-between rounded-full border border-line bg-bg/55 px-3 py-2 backdrop-blur-xl transition-all duration-500 md:px-4",
            compact ? "md:py-1.5" : "md:py-2.5",
          )}
        >
          <Link
            href="/"
            scroll={false}
            onClick={(event) => handleHomeSectionClick(event, "/")}
            className="inline-flex shrink-0 items-center rounded-[8px]"
            data-cursor="link"
            aria-label={`${profile.name} — home`}
          >
            <BrandMark className={cn("transition-all duration-500", compact ? "h-8 w-8" : "h-9 w-9 md:h-10 md:w-10")} />
          </Link>
          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const external = "external" in item && item.external;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={(event) => handleHomeSectionClick(event, item.href)}
                    data-cursor={external ? "external" : "link"}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={cn(
                      "rounded-full px-2.5 py-1.5 text-sm transition-colors",
                      active === item.id ? "text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-1">
            <ThemeToggle className="hidden lg:inline-flex" />
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="hidden rounded-full border border-line px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:text-fg lg:inline-flex"
              data-cursor="link"
            >
              ⌘K
            </button>
            <Link
              href="/contact"
              scroll={false}
              onClick={(event) => handleHomeSectionClick(event, "/contact")}
              className={cn(
                "hidden rounded-full px-4 py-1.5 text-sm font-medium lg:inline-flex",
                active === "contact" ? "btn-solid bg-[var(--accent)]" : "btn-solid",
              )}
              data-cursor="link"
            >
              Contact
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-fg lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <span className="relative block h-3 w-4">
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-px bg-fg transition-transform",
                    open && "translate-y-[5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-px bg-fg transition-transform",
                    open && "-translate-y-[6px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[46] bg-bg md:hidden"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex h-full flex-col justify-between px-5 pt-[max(6rem,calc(env(safe-area-inset-top)+4.75rem))] pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6">
              <ul className="flex flex-col gap-1">
                {navItems.map((item, i) => {
                  const external = "external" in item && item.external;
                  return (
                    <li key={item.id}>
                      <motion.a
                        href={item.href}
                        onClick={(event) => {
                          handleHomeSectionClick(event, item.href);
                          setOpen(false);
                        }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.5, ease: easeOutExpo }}
                        className="block py-2 text-3xl font-medium tracking-tight sm:text-4xl"
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {item.label}
                      </motion.a>
                    </li>
                  );
                })}
                <li>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * navItems.length, duration: 0.5, ease: easeOutExpo }}
                  >
                    <Link
                      href="/contact"
                      scroll={false}
                      onClick={(event) => {
                        handleHomeSectionClick(event, "/contact");
                        setOpen(false);
                      }}
                      className="block py-2 text-3xl font-medium tracking-tight sm:text-4xl"
                    >
                      Contact
                    </Link>
                  </motion.div>
                </li>
              </ul>
              <div className="flex flex-col gap-3 text-sm text-muted">
                <ThemeToggle className="self-start" />
                <a href={`mailto:${profile.email}`} className="text-fg">
                  {profile.email}
                </a>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <a href={social.github}>GitHub</a>
                  <Link href="/blog">Blogs</Link>
                  <a href={social.linkedin}>LinkedIn</a>
                  <a href={social.upwork}>Upwork</a>
                  <a href={social.calendly}>Calendly</a>
                  <a href={social.whatsapp}>WhatsApp</a>
                  <a href={profile.resumeUrl}>Resume</a>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
