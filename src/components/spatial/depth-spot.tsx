"use client";

import { useEffect } from "react";
import { useIsFinePointer } from "@/lib/use-media-query";
import { useMotionEnabled } from "@/lib/use-motion-enabled";

export function DepthSpot() {
  const fine = useIsFinePointer();
  const motionOn = useMotionEnabled();

  useEffect(() => {
    if (!fine || !motionOn) return;
    const root = document.documentElement;
    const onMove = (event: PointerEvent) => {
      root.style.setProperty("--spot-x", `${event.clientX}px`);
      root.style.setProperty("--spot-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [fine, motionOn]);

  if (!fine || !motionOn) return null;

  return <div className="spot" aria-hidden />;
}
