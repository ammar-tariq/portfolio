"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "@/types/content";
import { easeOutExpo } from "@/lib/motion";
import { ProjectHeroChrome, ProjectHeroMedia, projectHeroHeight } from "./project-hero";

type Origin = { top: number; left: number; width: number; height: number };

type Session = {
  project: Project;
  href: string;
  from: Origin;
  to: Origin;
  eyebrow: string;
  backHref: string;
  backLabel: string;
  leaving: boolean;
};

type ProjectOpenContextValue = {
  pendingSlug: string | null;
  openProject: (input: {
    project: Project;
    href: string;
    origin?: HTMLElement | null;
    eyebrow: string;
    backHref: string;
    backLabel: string;
  }) => void;
};

const ProjectOpenContext = createContext<ProjectOpenContextValue | null>(null);

function targetFrame(): Origin {
  return {
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: projectHeroHeight(),
  };
}

function originFrom(el?: HTMLElement | null): Origin {
  const rect = el?.getBoundingClientRect();
  if (rect && rect.width > 8 && rect.height > 8) {
    return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
  }
  const to = targetFrame();
  return {
    top: window.innerHeight * 0.28,
    left: window.innerWidth * 0.12,
    width: window.innerWidth * 0.76,
    height: Math.min(240, to.height * 0.45),
  };
}

export function ProjectOpenProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [session, setSession] = useState<Session | null>(null);
  const phase = useRef<"idle" | "expand" | "cover" | "leave">("idle");
  const hrefRef = useRef("");

  const finish = useCallback(() => {
    phase.current = "idle";
    hrefRef.current = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    setSession(null);
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const openProject = useCallback(
    (input: {
      project: Project;
      href: string;
      origin?: HTMLElement | null;
      eyebrow: string;
      backHref: string;
      backLabel: string;
    }) => {
      router.prefetch(input.href);
      if (reduced) {
        router.push(input.href);
        return;
      }
      hrefRef.current = input.href;
      phase.current = "expand";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      setSession({
        project: input.project,
        href: input.href,
        from: originFrom(input.origin),
        to: targetFrame(),
        eyebrow: input.eyebrow,
        backHref: input.backHref,
        backLabel: input.backLabel,
        leaving: false,
      });
    },
    [reduced, router],
  );

  useEffect(() => {
    if (!session || session.leaving) return;
    if (phase.current !== "expand") return;
    const timer = window.setTimeout(() => {
      if (phase.current !== "expand") return;
      phase.current = "cover";
      router.push(hrefRef.current);
    }, 820);
    return () => window.clearTimeout(timer);
  }, [session, router]);

  useEffect(() => {
    if (!session?.leaving) return;
    const timer = window.setTimeout(finish, 340);
    return () => window.clearTimeout(timer);
  }, [session?.leaving, finish]);

  useEffect(() => {
    if (!session || session.leaving) return;
    if (pathname !== session.href) return;
    if (phase.current !== "cover" && phase.current !== "expand") return;
    const timer = window.setTimeout(() => {
      phase.current = "leave";
      setSession((current) => (current ? { ...current, leaving: true } : current));
    }, 90);
    return () => window.clearTimeout(timer);
  }, [pathname, session]);

  useEffect(() => {
    if (!session) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (phase.current !== "expand") return;
      event.preventDefault();
      phase.current = "leave";
      hrefRef.current = "";
      setSession((current) => (current ? { ...current, leaving: true } : current));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session]);

  const value = {
    pendingSlug: session && !session.leaving ? session.project.slug : null,
    openProject,
  };

  return (
    <ProjectOpenContext.Provider value={value}>
      {children}
      {session
        ? createPortal(
            <div className="fixed inset-0 z-[80]">
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: session.leaving ? 0 : 1 }}
                transition={{ duration: 0.45, ease: easeOutExpo }}
              />
              <motion.div
                className="absolute overflow-hidden bg-bg-elevated shadow-[0_24px_80px_rgba(0,0,0,0.4)] will-change-[top,left,width,height,border-radius]"
                initial={{ ...session.from, borderRadius: 24, opacity: 1 }}
                animate={
                  session.leaving
                    ? { ...session.to, borderRadius: 0, opacity: 0 }
                    : { ...session.to, borderRadius: 0, opacity: 1 }
                }
                transition={{ duration: session.leaving ? 0.32 : 0.88, ease: easeOutExpo }}
              >
                <ProjectHeroMedia project={session.project} crossfade />
                <ProjectHeroChrome
                  project={session.project}
                  eyebrow={session.eyebrow}
                  backHref={session.backHref}
                  backLabel={session.backLabel}
                  delayed
                  titleAs="p"
                />
              </motion.div>
            </div>,
            document.body,
          )
        : null}
    </ProjectOpenContext.Provider>
  );
}

export function useProjectOpen() {
  const context = useContext(ProjectOpenContext);
  if (!context) {
    throw new Error("useProjectOpen must be used within ProjectOpenProvider");
  }
  return context;
}

export function shouldPassProjectClick(event: MouseEvent<HTMLElement>) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}
