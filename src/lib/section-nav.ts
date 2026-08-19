import {
  homeSectionById,
  homeSectionFromHref,
  homeSectionFromPathname,
  isHomeShellPath,
  type HomeSection,
} from "@/lib/home-sections";
import { scrollToSection } from "@/lib/scroll";

let urlSyncPausedUntil = 0;

function pauseHomeSectionUrlSync(ms = 1500) {
  urlSyncPausedUntil = Date.now() + ms;
}

export function goToHomeSection(section: HomeSection, options?: { instant?: boolean; replace?: boolean }) {
  if (typeof window === "undefined") return;
  const url = section.path;
  pauseHomeSectionUrlSync(options?.instant ? 400 : 1500);
  if (window.location.pathname !== url) {
    if (options?.replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  }
  scrollToSection(`#${section.id}`, { instant: options?.instant });
}

export function applyHomeSectionFromLocation(options?: { instant?: boolean }) {
  if (typeof window === "undefined") return;
  const fromHash = homeSectionFromHref(window.location.hash);
  if (fromHash && fromHash.path !== window.location.pathname) {
    window.history.replaceState(null, "", fromHash.path);
  }
  const section =
    homeSectionFromPathname(window.location.pathname) ?? homeSectionFromHref(window.location.hash);
  if (!section || (section.id === "hero" && !window.location.hash)) return;
  goToHomeSection(section, { instant: options?.instant, replace: true });
}

/** Keep one history entry while scrolling; the address bar follows the section in view. */
export function syncHomeSectionUrl(sectionId: string) {
  if (typeof window === "undefined") return;
  if (Date.now() < urlSyncPausedUntil) return;
  if (!isHomeShellPath(window.location.pathname)) return;
  const section = homeSectionById(sectionId);
  if (!section || window.location.pathname === section.path) return;
  window.history.replaceState(null, "", section.path);
}

function isModifiedClick(event: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/** Keep the single-page shell; only do a real navigation when leaving it. */
export function handleHomeSectionClick(
  event: {
    defaultPrevented: boolean;
    button: number;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    preventDefault: () => void;
  },
  href: string,
) {
  if (event.defaultPrevented || isModifiedClick(event)) return false;
  const section = homeSectionFromHref(href);
  if (!section) return false;
  if (!isHomeShellPath(window.location.pathname)) return false;
  event.preventDefault();
  goToHomeSection(section);
  return true;
}
