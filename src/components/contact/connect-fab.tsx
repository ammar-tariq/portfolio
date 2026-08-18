"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Calendar, Mail, MessageCircle, X } from "lucide-react";
import { useSite } from "@/components/providers/site-provider";
import { useContent } from "@/components/providers/content-provider";
import { cn } from "@/lib/cn";
import { easeOutExpo } from "@/lib/motion";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35ZM12.04 21.8h-.01A9.8 9.8 0 0 1 7.2 20.4L3 21.52l1.15-4.1a9.8 9.8 0 0 1-1.5-5.27C2.65 6.73 6.86 2.52 12.04 2.52c2.47 0 4.8.97 6.55 2.72A9.18 9.18 0 0 1 21.35 12.2c0 5.18-4.21 9.6-9.31 9.6Zm8.3-19.1A11.64 11.64 0 0 0 12.04 0C5.48 0 .15 5.33.16 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.87 11.87 0 0 0 5.73 1.46h.01c6.56 0 11.89-5.33 11.9-11.9 0-3.18-1.24-6.17-3.5-8.41Z" />
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

function UpworkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.56 8.22a5.6 5.6 0 0 0-5.4 4.07 8.8 8.8 0 0 0-.7-1.58c-.74-1.35-1.4-2.77-2.42-3.9A4.4 4.4 0 0 0 6.8 5.4 4.47 4.47 0 0 0 2.3 9.9c0 .3.03.6.08.9H4.5a2.36 2.36 0 0 1 4.7 0c.4 2.26 1.74 4.35 2.8 6.5H7.5v2.15h9.07v-2.15h-2.3c-.7-1.48-1.46-3.1-1.9-4.7a3.5 3.5 0 0 1 3.4-2.73 2.6 2.6 0 0 1 2.64 2.7c0 2.5-1.56 4.55-3.7 4.55v2.16c3.36 0 5.9-2.76 5.9-6.7a4.63 4.63 0 0 0-4.85-5.11Z" />
    </svg>
  );
}

export function ConnectFab() {
  const { commandOpen, terminalOpen } = useSite();
  const { profile, social } = useContent();
  const actions = [
    { id: "whatsapp", label: "WhatsApp", href: social.whatsapp, icon: WhatsAppIcon },
    { id: "email", label: "Email", href: `mailto:${profile.email}`, icon: Mail },
    { id: "calendly", label: "Book a meeting", href: social.calendly, icon: Calendar },
    { id: "linkedin", label: "LinkedIn", href: social.linkedin, icon: LinkedInIcon },
    { id: "upwork", label: "Upwork", href: social.upwork, icon: UpworkIcon },
  ] as const;
  const [open, setOpen] = useState(false);
  const [atContact, setAtContact] = useState(false);
  const overlayOpen = commandOpen || terminalOpen;
  const menuOpen = open && !overlayOpen && !atContact;

  useEffect(() => {
    const el = document.getElementById("contact");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setAtContact(visible);
        if (visible) setOpen(false);
      },
      { threshold: 0.18, rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (overlayOpen || atContact) return null;

  return (
    <>
      <AnimatePresence>
        {menuOpen ? (
          <motion.button
            type="button"
            aria-label="Dismiss connect menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-bg/40 md:bg-transparent"
          />
        ) : null}
      </AnimatePresence>
      <div
        className="fixed z-40 flex max-h-[min(72svh,28rem)] flex-col items-end gap-2.5 md:gap-3"
        style={{
          right: "max(1rem, env(safe-area-inset-right))",
          bottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <AnimatePresence>
          {menuOpen ? (
            <motion.ul
              key="actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.28, ease: easeOutExpo }}
              className="mb-1 flex max-h-[min(52svh,20rem)] flex-col items-end gap-2 overflow-y-auto overscroll-contain pr-0.5"
              data-lenis-prevent
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                const external = action.href.startsWith("http");
                return (
                  <motion.li
                    key={action.id}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.04 * index, duration: 0.28, ease: easeOutExpo }}
                  >
                    <a
                      href={action.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      data-cursor={external ? "external" : "link"}
                      className="group flex items-center gap-2.5 sm:gap-3"
                      onClick={() => setOpen(false)}
                    >
                      <span className="max-w-[46vw] truncate rounded-full border border-line bg-bg/90 px-3 py-1.5 text-sm text-fg shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-md sm:max-w-none">
                        {action.label}
                      </span>
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-bg-elevated text-accent shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-bg sm:h-11 sm:w-11">
                        <Icon className="h-4 w-4" />
                      </span>
                    </a>
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : null}
        </AnimatePresence>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-label={open ? "Close connect menu" : "Connect"}
          data-cursor="link"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium shadow-[0_16px_50px_rgba(21,88,210,0.35)] transition-colors sm:h-14 sm:px-5",
            open ? "bg-fg text-bg" : "bg-accent text-bg hover:bg-[#1a8ee8]",
          )}
        >
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
          <span className="pr-0.5">{open ? "Close" : "Connect"}</span>
        </button>
      </div>
    </>
  );
}
