"use client";

import { useLayoutEffect } from "react";
import { applyHomeSectionFromLocation } from "@/lib/section-nav";

export function HomeSectionSync() {
  useLayoutEffect(() => {
    applyHomeSectionFromLocation({ instant: true });
    const retry = window.setTimeout(() => applyHomeSectionFromLocation({ instant: true }), 120);
    const onPop = () => applyHomeSectionFromLocation({ instant: false });
    window.addEventListener("popstate", onPop);
    return () => {
      window.clearTimeout(retry);
      window.removeEventListener("popstate", onPop);
    };
  }, []);
  return null;
}
