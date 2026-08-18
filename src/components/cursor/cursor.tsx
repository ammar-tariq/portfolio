"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "motion/react";
import { useIsFinePointer } from "@/lib/use-media-query";
import { useMotionEnabled } from "@/lib/use-motion-enabled";

type CursorKind = "default" | "link" | "view" | "external" | "hidden";

const labels: Partial<Record<CursorKind, string>> = {
  view: "View",
  external: "→",
};

export function Cursor() {
  const fine = useIsFinePointer();
  const motionOn = useMotionEnabled();
  const [kind, setKind] = useState<CursorKind>("default");
  const [visible, setVisible] = useState(false);
  const x = useSpring(0, { stiffness: 500, damping: 35, mass: 0.25 });
  const y = useSpring(0, { stiffness: 500, damping: 35, mass: 0.25 });

  useEffect(() => {
    if (!fine || !motionOn) return;

    document.documentElement.classList.add("cursor-none-desktop");

    const kindFromTarget = (target: EventTarget | null) => {
      const el = (target as HTMLElement | null)?.closest("[data-cursor]");
      return (el?.getAttribute("data-cursor") as CursorKind | undefined) ?? "default";
    };

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      setKind(document.documentElement.dataset.atomHit === "1" ? "link" : kindFromTarget(event.target));
    };

    const onOver = (event: MouseEvent) => {
      if (document.documentElement.dataset.atomHit === "1") {
        setKind("link");
        return;
      }
      setKind(kindFromTarget(event.target));
    };

    const hide = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseleave", hide);
    return () => {
      document.documentElement.classList.remove("cursor-none-desktop");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseleave", hide);
    };
  }, [fine, motionOn, x, y]);

  if (!fine || !motionOn) return null;

  const expanded = kind === "link" || kind === "view" || kind === "external";
  const size = kind === "view" ? 72 : expanded ? 44 : 10;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[90] hidden mix-blend-difference md:flex"
      style={{ x, y, translateX: "-50%", translateY: "-50%" }}
    >
      <motion.div
        animate={{
          width: size,
          height: size,
          opacity: visible && kind !== "hidden" ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="flex items-center justify-center rounded-full border border-white/80 bg-white/10 text-[10px] font-medium tracking-[0.18em] text-white uppercase"
      >
        {labels[kind] ?? ""}
      </motion.div>
    </motion.div>
  );
}
