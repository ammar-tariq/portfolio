"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/cn";
import { useIsFinePointer } from "@/lib/use-media-query";
import { useMotionEnabled } from "@/lib/use-motion-enabled";

export function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useIsFinePointer();
  const motionOn = useMotionEnabled();
  const rx = useSpring(0, { stiffness: 180, damping: 20 });
  const ry = useSpring(0, { stiffness: 180, damping: 20 });
  const px = useMotionValue(50);
  const py = useMotionValue(20);
  const glare = useMotionTemplate`radial-gradient(540px circle at ${px}% ${py}%, rgba(79,187,242,0.22), transparent 42%)`;

  function onMove(event: React.MouseEvent) {
    if (!fine || !motionOn || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    ry.set((x - 0.5) * 16);
    rx.set((0.5 - y) * 12);
    px.set(x * 100);
    py.set(y * 100);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className={cn("group relative [transform-style:preserve-3d]", className)}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glare }}
      />
    </motion.div>
  );
}
