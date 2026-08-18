import { NextResponse } from "next/server";
import { hasFirebaseMessaging } from "@/lib/env";
import { firebaseWebConfig } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasFirebaseMessaging()) {
    return new NextResponse("/* Firebase messaging is not configured. */\n", {
      status: 404,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }

  const config = JSON.stringify(firebaseWebConfig());
  const script = `/* firebase messaging service worker — admin scope only */
importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js");
firebase.initializeApp(${config});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;
  const title = payload.data?.title || "Portfolio";
  const body = payload.data?.body || "";
  const url = payload.data?.url || "/admin";
  self.registration.showNotification(title, { body, icon: "/logo-at.png", data: { url } });
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin";
  event.waitUntil(self.clients.openWindow(url));
});
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
