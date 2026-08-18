"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics({ id }: { id: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!id) return;
    const existing = document.getElementById("ga-gtag");
    if (!existing) {
      window.dataLayer = window.dataLayer ?? [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
      window.gtag("js", new Date());
      const script = document.createElement("script");
      script.id = "ga-gtag";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      document.head.appendChild(script);
    }
  }, [id]);

  useEffect(() => {
    if (!id || !pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    window.gtag?.("config", id, { page_path: pathname, anonymize_ip: true });
  }, [id, pathname]);

  return null;
}
