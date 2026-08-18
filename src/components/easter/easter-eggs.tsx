"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSite } from "@/components/providers/site-provider";
import { useContent } from "@/components/providers/content-provider";
import { easeOutExpo } from "@/lib/motion";
import { goToHomeSection } from "@/lib/section-nav";
import { homeSectionById } from "@/lib/home-sections";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function EasterEggs() {
  const { terminalOpen, setTerminalOpen, setCommandOpen } = useSite();
  const { profile, social } = useContent();
  const [lines, setLines] = useState<string[]>([
    `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()} — ready.`,
    "type help",
  ]);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef<string[]>([]);

  useEffect(() => {
    console.info(
      `%c${profile.name.toUpperCase()}`,
      "font-family:ui-serif,Georgia,serif;font-size:22px;color:#4fbbf2;letter-spacing:0.08em;",
    );
    console.info(
      "%cBuilding serious software. Press ⌘K. Press ~ for a quieter terminal.",
      "color:#7d8a9a;",
    );
  }, [profile.name]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (event.key === "`" && tag !== "INPUT" && tag !== "TEXTAREA") {
        event.preventDefault();
        setTerminalOpen(!terminalOpen);
      }

      seq.current = [...seq.current, event.key].slice(-KONAMI.length);
      if (KONAMI.every((key, i) => seq.current[i] === key)) {
        document.documentElement.style.setProperty("--accent", "#9bb6ff");
        console.info("%cSystem palette shifted.", "color:#9bb6ff");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTerminalOpen, terminalOpen]);

  useEffect(() => {
    if (terminalOpen) inputRef.current?.focus();
  }, [terminalOpen]);

  function run(raw: string) {
    const [verb] = raw.trim().toLowerCase().split(/\s+/);
    const out: string[] = [`› ${raw}`];
    switch (verb) {
      case "help":
        out.push("whoami · portfolio · contact · github · clear · exit");
        break;
      case "whoami":
        out.push(`${profile.name} — ${profile.title}`);
        out.push(profile.headline);
        break;
      case "work":
      case "portfolio":
        goToHomeSection(homeSectionById("portfolio")!);
        out.push("scrolling to portfolio.");
        break;
      case "contact":
        out.push(profile.email);
        break;
      case "github":
        window.open(social.github, "_blank", "noopener,noreferrer");
        out.push(social.github);
        break;
      case "clear":
        setLines([]);
        setValue("");
        return;
      case "palette":
      case "cmd":
        setCommandOpen(true);
        out.push("opened command palette.");
        break;
      case "exit":
        setTerminalOpen(false);
        out.push("bye.");
        break;
      default:
        out.push(`command not found: ${raw}`);
    }
    setLines((prev) => [...prev, ...out].slice(-24));
    setValue("");
  }

  return (
    <AnimatePresence>
      {terminalOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: easeOutExpo }}
          className="panel fixed right-4 bottom-4 z-[60] hidden w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl md:block"
        >
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <p className="font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">
              tty · {profile.firstName.toLowerCase()}
            </p>
            <button
              type="button"
              className="font-mono text-[10px] text-subtle"
              onClick={() => setTerminalOpen(false)}
            >
              close
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto px-3 py-3 font-mono text-[12px] leading-6 text-muted">
            {lines.map((line, i) => (
              <p key={`${line}-${i}`}>{line}</p>
            ))}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (value.trim()) run(value);
              }}
              className="flex gap-2 text-fg"
            >
              <span className="text-accent">❯</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="w-full bg-transparent outline-none"
                aria-label="Terminal command"
                autoComplete="off"
              />
            </form>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
