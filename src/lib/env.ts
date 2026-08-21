export function hasMongo() {
  return Boolean(process.env.MONGODB_URI);
}

const DEFAULT_SITE_HOST = "ammartariq.com";
const PLACEHOLDER_HOSTS = new Set(["example.com", "www.example.com", "localhost", "127.0.0.1"]);

function hostnameOf(value: string) {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function originOf(value: string | undefined) {
  const raw = value?.trim();
  if (!raw) return "";
  const host = hostnameOf(raw);
  if (!host || PLACEHOLDER_HOSTS.has(host)) return "";
  return `https://${host}`;
}

// Public site host. SITE_HOST wins; otherwise AUTH_URL if it is not localhost;
// otherwise the production domain. Used for outbound User-Agents and notification copy.
export function siteHost() {
  return (
    originOf(process.env.SITE_HOST)?.replace(/^https:\/\//, "") ||
    originOf(process.env.AUTH_URL)?.replace(/^https:\/\//, "") ||
    DEFAULT_SITE_HOST
  );
}

// Canonical public origin for sitemap, robots, JSON-LD, and metadata.
// Never returns example.com / localhost — those break Google Search Console.
export function siteOrigin(website?: string) {
  return originOf(website) || originOf(process.env.AUTH_URL) || `https://${siteHost()}`;
}

export function hasCloudinary() {
  const url = process.env.CLOUDINARY_URL ?? "";
  if (url.startsWith("cloudinary://") && !url.includes("<your_") && /cloudinary:\/\/[^:]+:[^@]+@/.test(url)) {
    return true;
  }
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

// No default: if ADMIN_GITHUB_LOGIN is unset, admin access is denied (see auth.ts).
// Never hardcode a real GitHub login here — this file is public.
export function adminGithubLogin() {
  return (process.env.ADMIN_GITHUB_LOGIN ?? "").trim().toLowerCase();
}

export function hasGemini() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function googleAnalyticsId() {
  const id = process.env.GA_MEASUREMENT_ID?.trim() ?? "";
  return /^G-[A-Z0-9]+$/i.test(id) ? id : "";
}

export function googleTagManagerId() {
  const id = process.env.GTM_CONTAINER_ID?.trim() ?? "";
  return /^GTM-[A-Z0-9]+$/i.test(id) ? id : "";
}

export function hasSmtpVisitNotify() {
  return Boolean(
    (process.env.NOTIFY_EMAIL?.trim() || process.env.SMTP_USER?.trim()) &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

export function hasFirebaseMessaging() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() &&
      process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
      process.env.FIREBASE_PRIVATE_KEY?.trim() &&
      process.env.FIREBASE_WEB_API_KEY?.trim() &&
      process.env.FIREBASE_WEB_APP_ID?.trim() &&
      process.env.FIREBASE_MESSAGING_SENDER_ID?.trim() &&
      process.env.FIREBASE_VAPID_KEY?.trim(),
  );
}

export function hasVisitNotify() {
  return hasSmtpVisitNotify() || hasFirebaseMessaging();
}

export function notifyTimeZone() {
  return process.env.NOTIFY_TZ?.trim() || "Asia/Karachi";
}

export function notifyDigestHour() {
  const hour = Number(process.env.NOTIFY_DIGEST_HOUR);
  return Number.isFinite(hour) ? Math.min(23, Math.max(0, Math.trunc(hour))) : 21;
}

export function hasUsajobs() {
  return Boolean(process.env.USAJOBS_API_KEY?.trim() && process.env.USAJOBS_USER_AGENT?.trim());
}

export function googleMapsApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY?.trim() ?? "";
}
