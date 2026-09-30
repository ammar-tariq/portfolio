import type Lenis from "lenis";

export const SCROLL_OFFSET = -104;

export function scrollEase(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

let lenis: Lenis | null = null;

export function bindLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

export function scrollToSection(target: string, options?: { instant?: boolean }) {
  const run = (tries: number) => {
    const el = document.querySelector(target);
    if (!el) {
      if (tries < 30) requestAnimationFrame(() => run(tries + 1));
      return;
    }

    const instant = options?.instant ?? false;
    if (lenis) {
      lenis.scrollTo(target, {
        offset: SCROLL_OFFSET,
        duration: instant ? 0 : 1.8,
        easing: scrollEase,
        force: true,
      });
      return;
    }

    el.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
  };

  run(0);
}
