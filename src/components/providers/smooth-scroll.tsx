"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { bindLenis, SCROLL_OFFSET, scrollEase } from "@/lib/scroll";
import { useSite } from "./site-provider";

const options = {
  autoRaf: true,
  lerp: 0.045,
  smoothWheel: true,
  wheelMultiplier: 0.72,
  syncTouch: false,
  anchors: {
    offset: SCROLL_OFFSET,
    duration: 1.8,
    easing: scrollEase,
  },
  stopInertiaOnNavigate: true,
  allowNestedScroll: true,
  autoToggle: true,
  respectReducedMotion: true,
};

function LenisBridge() {
  const lenis = useLenis();
  const { commandOpen } = useSite();

  useEffect(() => {
    bindLenis(lenis ?? null);
    return () => bindLenis(null);
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;
    if (commandOpen) lenis.stop();
    else lenis.start();
  }, [lenis, commandOpen]);

  return null;
}

export function SmoothScroll() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <ReactLenis root options={options}>
      <LenisBridge />
    </ReactLenis>
  );
}
