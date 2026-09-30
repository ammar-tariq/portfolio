"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Calendar, Mail, MessageCircle, X } from "lucide-react";
import { useSite } from "@/components/providers/site-provider";
import { useContent } from "@/components/providers/content-provider";
import { LinkedInIcon, UpworkIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { easeOutExpo } from "@/lib/motion";

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
                      <span className="border-b border-line bg-bg px-2 py-1 text-sm text-fg">
                        {action.label}
                      </span>
                      <span className="meta-label inline-flex h-9 w-9 shrink-0 items-center justify-center border border-line text-accent">
                        <Icon className="h-3.5 w-3.5" />
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
          className="inline-flex items-center gap-2 border border-line bg-bg px-3 py-2 text-sm text-fg transition-colors duration-[var(--dur)] hover:border-accent hover:text-accent"
        >
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
          <span className="pr-0.5">{open ? "Close" : "Connect"}</span>
        </button>
      </div>
    </>
  );
}
