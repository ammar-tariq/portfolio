"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadWhenIdle(fn: () => void) {
  const ric = window.requestIdleCallback?.bind(window);
  if (ric) {
    const id = ric(fn, { timeout: 4000 });
    return () => window.cancelIdleCallback?.(id);
  }
  const timer = window.setTimeout(fn, 2800);
  return () => window.clearTimeout(timer);
}

function injectScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function GoogleAnalytics({ gaId, gtmId }: { gaId?: string; gtmId?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!gaId && !gtmId) return;
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      if (gaId) {
        window.dataLayer = window.dataLayer ?? [];
        window.gtag = function gtag(...args: unknown[]) {
          window.dataLayer?.push(args);
        };
        window.gtag("js", new Date());
        window.gtag("config", gaId, { anonymize_ip: true });
        injectScript("ga-gtag", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`);
      } else if (gtmId) {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
        injectScript("gtm-js", `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
      }
    };
    const stopIdle = loadWhenIdle(load);
    const onInteract = () => load();
    window.addEventListener("pointerdown", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    window.addEventListener("scroll", onInteract, { once: true, passive: true });
    return () => {
      stopIdle();
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("scroll", onInteract);
    };
  }, [gaId, gtmId]);

  useEffect(() => {
    if (!gaId || !pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    window.gtag?.("config", gaId, { page_path: pathname, anonymize_ip: true });
  }, [gaId, pathname]);

  return null;
}
