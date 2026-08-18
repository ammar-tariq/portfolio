export function hasMongo() {
  return Boolean(process.env.MONGODB_URI);
}

// Public site host, from env. Falls back to a generic value so no real domain is
// hardcoded in the repo. Used for outbound User-Agents and notification copy.
export function siteHost() {
  return process.env.SITE_HOST?.trim() || "example.com";
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

export function hasVisitNotify() {
  return Boolean(
    (process.env.NOTIFY_EMAIL?.trim() || process.env.SMTP_USER?.trim()) &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}
