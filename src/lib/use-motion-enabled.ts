"use client";

import { useReducedMotion } from "motion/react";

export function useMotionEnabled() {
  const reduced = useReducedMotion();
  return !reduced;
}
