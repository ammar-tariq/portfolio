import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { hasFirebaseMessaging, siteHost } from "@/lib/env";

function privateKey() {
  return (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n").trim();
}

export function firebaseAdmin() {
  if (!hasFirebaseMessaging()) throw new Error("Firebase messaging is not configured.");
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!.trim(),
        privateKey: privateKey(),
      }),
    });
  }
  return getMessaging();
}

export function firebaseWebConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() ?? "";
  return {
    apiKey: process.env.FIREBASE_WEB_API_KEY?.trim() ?? "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN?.trim() || (projectId ? `${projectId}.firebaseapp.com` : ""),
    projectId,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "",
    appId: process.env.FIREBASE_WEB_APP_ID?.trim() ?? "",
  };
}

export function firebaseVapidKey() {
  return process.env.FIREBASE_VAPID_KEY?.trim() ?? "";
}

export function publicOrigin() {
  const fromAuth = process.env.AUTH_URL?.trim().replace(/\/$/, "");
  if (fromAuth) return fromAuth;
  const host = siteHost();
  if (host && host !== "example.com") return `https://${host}`;
  return "";
}
