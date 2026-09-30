"use client";

import { useEffect, useMemo, useState } from "react";
import { useLenis } from "lenis/react";
import Link from "next/link";
import { useContent } from "@/components/providers/content-provider";
import { useSite } from "@/components/providers/site-provider";
import { Menu, Search, X } from "lucide-react";
import { navIcon } from "@/lib/marks";
import { ThemeToggle } from "./theme-toggle";
import { BrandMark } from "@/components/ui/brand-mark";
import { DOSSIER } from "@/lib/dossier";
import { HOME_SECTIONS } from "@/lib/home-sections";
import { handleHomeSectionClick, syncHomeSectionUrl } from "@/lib/section-nav";
import { cn } from "@/lib/cn";

const HIGHLIGHT: Record<string, string> = {
  faq: "about",
  cursor: "open-source",
};

export function Navigation() {
  const { setCommandOpen } = useSite();
  const { navItems, profile } = useContent();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("hero");

  const items = useMemo(() => {
    const known = new Set<string>(DOSSIER.map((item) => item.id));
    const indexed = DOSSIER.filter((item) => item.id !== "hero").map((item) => {
      const fromNav = navItems.find((nav) => nav.id === item.id);
      return {
        id: item.id,
        label: fromNav?.label ?? item.label,
        href: fromNav?.href ?? item.href,
        external: Boolean(fromNav && "external" in fromNav && fromNav.external),
      };
    });
    const extras = navItems
      .filter((nav) => !known.has(nav.id))
      .map((nav) => ({
        id: nav.id,
        label: nav.label,
        href: nav.href,
        external: Boolean("external" in nav && nav.external),
      }));
    const contact = indexed.pop();
    return contact ? [...indexed, ...extras, contact] : [...indexed, ...extras];
  }, [navItems]);

  useEffect(() => {
    const ids = HOME_SECTIONS.map((section) => section.id);
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) ratios.set(entry.target.id, entry.intersectionRatio);
          else ratios.delete(entry.target.id);
        }
        let bestId = "";
        let bestRatio = -1;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (!bestId) return;
        setActive(bestId);
        syncHomeSectionUrl(bestId);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.08, 0.18, 0.32, 0.5, 0.72] },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    const cursor = document.getElementById("cursor");
    if (cursor) observer.observe(cursor);
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

  const current = HIGHLIGHT[active] ?? active;

  return (
    <header className="site-header">
      <div className="site-bar glass-quiet settle rounded-full border">
        <Link
          href="/"
          scroll={false}
          onClick={(event) => {
            handleHomeSectionClick(event, "/");
            setOpen(false);
          }}
          className="inline-flex shrink-0 items-center gap-2.5 pl-1 text-sm tracking-tight"
        >
          <BrandMark className="h-8 w-8" name={profile.name} />
          <span className="hidden font-medium sm:inline">{profile.name}</span>
        </Link>
        <nav aria-label="Primary" className="hidden min-w-0 flex-1 overflow-x-auto min-[1000px]:block [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <IndexList items={items} current={current} className="flex-row items-center gap-x-0.5" />
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <ThemeToggle className="nav-link" />
          <button type="button" onClick={() => setCommandOpen(true)} className="nav-link meta-label hidden items-center gap-1.5 text-fg min-[1000px]:inline-flex">
            <Search className="h-3.5 w-3.5 text-accent" aria-hidden />
            Search
          </button>
          <button
            type="button"
            className="nav-link meta-label inline-flex items-center gap-1.5 text-fg min-[1000px]:hidden"
            aria-expanded={open}
            aria-controls="site-index"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-3.5 w-3.5" aria-hidden /> : <Menu className="h-3.5 w-3.5" aria-hidden />}
            {open ? "Close" : "Index"}
          </button>
        </div>
      </div>
      {open ? (
        <nav
          id="site-index"
          aria-label="Primary"
          className="glass-quiet pointer-events-auto mt-2 max-h-[70dvh] overflow-y-auto rounded-3xl border px-4 py-3 min-[1000px]:hidden"
        >
          <IndexList items={items} current={current} onNavigate={() => setOpen(false)} />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCommandOpen(true);
            }}
            className="meta-label mt-4 inline-flex items-center gap-1.5 text-fg"
          >
            <Search className="h-3.5 w-3.5 text-accent" aria-hidden />
            Search
          </button>
        </nav>
      ) : null}
    </header>
  );
}

function IndexList({
  items,
  current,
  onNavigate,
  className,
}: {
  items: {
    id: string;
    label: string;
    href: string;
    external: boolean;
  }[];
  current: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {items.map((item) => {
        const selected = current === item.id;
        const Icon = navIcon(item.id);
        return (
          <li key={item.id}>
            <a
              href={item.href}
              aria-current={selected ? "true" : undefined}
              data-cursor={item.external ? "external" : "link"}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={(event) => {
                handleHomeSectionClick(event, item.href);
                onNavigate?.();
              }}
              className={cn(
                "nav-link inline-flex items-center gap-1.5 py-1.5 text-[13px] tracking-tight whitespace-nowrap transition-colors duration-[var(--dur)]",
                selected ? "text-fg" : "text-subtle hover:text-fg",
              )}
            >
              <Icon className="h-3.5 w-3.5 text-accent" aria-hidden />
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
