"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useSite } from "@/components/providers/site-provider";
import { useContent } from "@/components/providers/content-provider";
import { easeOutExpo } from "@/lib/motion";
import { scrollToSection } from "@/lib/scroll";
import { goToHomeSection } from "@/lib/section-nav";
import { homeSectionFromHref, isHomeShellPath } from "@/lib/home-sections";
import { BLOG_PATH } from "@/lib/blog";

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useSite();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(!commandOpen);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen]);

  return (
    <AnimatePresence>
      {commandOpen ? <Palette onClose={() => setCommandOpen(false)} /> : null}
    </AnimatePresence>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const { toggleTheme } = useSite();

  const { commands } = useContent();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (command) =>
        command.label.toLowerCase().includes(q) ||
        command.hint.toLowerCase().includes(q) ||
        command.id.includes(q),
    );
  }, [query, commands]);

  const activeIndex = Math.min(index, Math.max(filtered.length - 1, 0));

  function run(href: string, external?: boolean) {
    onClose();
    if (href === "action:theme") {
      toggleTheme();
      return;
    }
    if (external || href.startsWith("http") || href.startsWith("mailto:")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    const section = homeSectionFromHref(href);
    if (section) {
      if (isHomeShellPath(window.location.pathname)) goToHomeSection(section);
      else router.push(section.path);
      return;
    }
    if (href.startsWith("#")) {
      scrollToSection(href);
      return;
    }
    if (href === BLOG_PATH) {
      window.location.assign(href);
      return;
    }
    router.push(href);
  }

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[max(4.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[18vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
        aria-label="Close command palette"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.35, ease: easeOutExpo }}
        className="panel relative w-full max-w-xl overflow-hidden rounded-2xl"
        data-lenis-prevent
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span className="font-mono text-[10px] tracking-[0.18em] text-subtle uppercase">
            Search
          </span>
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setIndex((i) => Math.min(i + 1, filtered.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              }
              if (event.key === "Enter" && filtered[activeIndex]) {
                event.preventDefault();
                const command = filtered[activeIndex];
                run(command.href, "external" in command ? command.external : false);
              }
            }}
            placeholder="Go to portfolio, experience, GitHub…"
            className="h-14 w-full bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
          />
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-subtle sm:inline">
            ESC
          </kbd>
        </div>
        <ul className="max-h-[min(20rem,52svh)] overflow-y-auto p-2 sm:max-h-80">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-sm text-muted">No matches.</li>
          ) : (
            filtered.map((command, i) => (
              <li key={command.id}>
                <button
                  type="button"
                  onClick={() =>
                    run(command.href, "external" in command ? command.external : false)
                  }
                  onMouseEnter={() => setIndex(i)}
                  className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    i === activeIndex ? "bg-fg/8 text-fg" : "text-muted hover:bg-fg/5"
                  }`}
                >
                  <span className="min-w-0 truncate text-sm">{command.label}</span>
                  <span className="hidden shrink-0 font-mono text-[10px] tracking-wide text-subtle uppercase sm:inline">
                    {command.hint}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">
          <span>⌘K · Ctrl K</span>
          <span>↑↓ Enter</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
