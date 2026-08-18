"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export function useIsFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 768px)");
}
