"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SESSION_KEY = "visit-session";
const STARTED_KEY = "visit-started";
const PATHS_KEY = "visit-paths";
const SENT_KEY = "visit-sent";

type VisitPath = { path: string; at: number };

function sessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
      sessionStorage.setItem(STARTED_KEY, String(Date.now()));
    }
    return id;
  } catch {
    return "";
  }
}

function externalReferrer() {
  try {
    if (!document.referrer) return "";
    const url = new URL(document.referrer);
    if (url.origin === window.location.origin) return "";
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function recordPath(path: string) {
  try {
    const raw = sessionStorage.getItem(PATHS_KEY);
    const paths: VisitPath[] = raw ? (JSON.parse(raw) as VisitPath[]) : [];
    const last = paths[paths.length - 1];
    if (last?.path === path) return;
    paths.push({ path, at: Date.now() });
    sessionStorage.setItem(PATHS_KEY, JSON.stringify(paths.slice(-40)));
  } catch {
    /* ignore quota */
  }
}

function beacon(url: string, payload: unknown) {
  const body = JSON.stringify(payload);
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(url, blob)) return;
  } catch {
    /* fall through */
  }
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

function sendPageView(path: string) {
  beacon("/api/analytics", { path, referrer: externalReferrer() });
}

function sendSessionSummary() {
  try {
    if (sessionStorage.getItem(SENT_KEY)) return;
    const id = sessionStorage.getItem(SESSION_KEY);
    const startedAt = Number(sessionStorage.getItem(STARTED_KEY) ?? "");
    const raw = sessionStorage.getItem(PATHS_KEY);
    if (!id || !raw) return;
    sessionStorage.setItem(SENT_KEY, "1");
    beacon("/api/analytics/session", {
      sessionId: id,
      paths: JSON.parse(raw) as VisitPath[],
      startedAt: startedAt || Date.now(),
      referrer: externalReferrer(),
    });
  } catch {
    /* ignore */
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    sessionId();
    recordPath(pathname);
    sendPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const onHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      sendSessionSummary();
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  return null;
}
