"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { FirebaseOptions } from "firebase/app";

type Status = "off" | "loading" | "on" | "error";

const SW_URL = "/admin/firebase-messaging-sw.js";
const SW_SCOPE = "/admin/";

async function firebaseMessaging() {
  const [{ initializeApp, getApps }, { getMessaging, getToken, isSupported, onMessage }] = await Promise.all([
    import("firebase/app"),
    import("firebase/messaging"),
  ]);
  return { initializeApp, getApps, getMessaging, getToken, isSupported, onMessage };
}

async function dropPublicMessagingWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map(async (registration) => {
      const script =
        registration.active?.scriptURL ||
        registration.waiting?.scriptURL ||
        registration.installing?.scriptURL ||
        "";
      const scopePath = new URL(registration.scope).pathname;
      const ours = script.includes("firebase-messaging-sw");
      const publicScope = scopePath === "/" || !scopePath.startsWith("/admin");
      if (ours && publicScope) await registration.unregister();
    }),
  );
}

function readStoredPushEnabled() {
  if (typeof window === "undefined") return false;
  try {
    return (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted" &&
      localStorage.getItem("admin-push") === "1"
    );
  } catch {
    return false;
  }
}

export function PushEnable({ configured }: { configured: boolean }) {
  const pathname = usePathname();
  const onAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const [status, setStatus] = useState<Status>("off");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured || !onAdmin) return;
    void dropPublicMessagingWorkers();
    if (!readStoredPushEnabled()) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) void enable(false);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, onAdmin]);

  async function enable(interactive: boolean) {
    if (!configured || !onAdmin) return;
    setStatus("loading");
    setError("");
    try {
      if (typeof Notification === "undefined") throw new Error("This browser does not support notifications.");
      const supported = await (await firebaseMessaging()).isSupported();
      if (!supported) {
        throw new Error("Web push is not supported here. On iPhone, add the admin page to the Home Screen first.");
      }
      const permission = interactive ? await Notification.requestPermission() : Notification.permission;
      if (permission !== "granted") {
        setStatus("off");
        if (interactive) setError("Notifications were blocked.");
        return;
      }
      await dropPublicMessagingWorkers();
      const configRes = await fetch("/api/admin/push/config");
      const configJson = (await configRes.json()) as {
        ok: boolean;
        vapidKey?: string;
        config?: Record<string, string>;
        error?: string;
      };
      if (!configJson.ok || !configJson.config || !configJson.vapidKey) {
        throw new Error(configJson.error || "Could not load Firebase config.");
      }
      const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
      const { initializeApp, getApps, getMessaging, getToken, onMessage } = await firebaseMessaging();
      const app = getApps()[0] ?? initializeApp(configJson.config as FirebaseOptions);
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: configJson.vapidKey,
        serviceWorkerRegistration: registration,
      });
      if (!token) throw new Error("Firebase did not return a device token.");
      const saved = await fetch("/api/admin/push/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const savedJson = (await saved.json()) as { ok: boolean; error?: string };
      if (!savedJson.ok) throw new Error(savedJson.error || "Could not save the token.");
      localStorage.setItem("admin-push", "1");
      localStorage.setItem("admin-push-token", token);
      onMessage(messaging, (payload) => {
        if (!window.location.pathname.startsWith("/admin")) return;
        const title = payload.notification?.title || "Portfolio";
        const body = payload.notification?.body || "";
        if (Notification.permission === "granted") {
          new Notification(title, { body, icon: "/logo-at.png" });
        }
      });
      setStatus("on");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not enable push.");
    }
  }

  async function disable() {
    const token = localStorage.getItem("admin-push-token");
    localStorage.removeItem("admin-push");
    localStorage.removeItem("admin-push-token");
    await dropPublicMessagingWorkers();
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(async (registration) => {
          const script =
            registration.active?.scriptURL ||
            registration.waiting?.scriptURL ||
            registration.installing?.scriptURL ||
            "";
          if (script.includes("firebase-messaging-sw")) await registration.unregister();
        }),
      );
    }
    if (token) {
      await fetch("/api/admin/push/token", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    }
    setStatus("off");
    setError("");
  }

  if (!configured || !onAdmin) return null;

  return (
    <span className="flex flex-col items-end gap-1">
      {status === "on" ? (
        <button type="button" onClick={() => void disable()} className="text-muted hover:text-fg">
          Disable push
        </button>
      ) : (
        <button
          type="button"
          disabled={status === "loading"}
          onClick={() => void enable(true)}
          className="text-muted hover:text-fg disabled:opacity-50"
        >
          {status === "loading" ? "Enabling…" : "Enable push"}
        </button>
      )}
      {error ? <span className="max-w-52 text-right text-[11px] text-muted">{error}</span> : null}
    </span>
  );
}
