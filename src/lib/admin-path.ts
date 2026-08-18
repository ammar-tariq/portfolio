function safeAdminCallback(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "/admin";
  if (!raw.startsWith("/admin")) return "/admin";
  if (raw.startsWith("//") || raw.includes("://")) return "/admin";
  if (raw.startsWith("/admin/login")) return "/admin";
  return raw;
}

export function adminLoginPath(next?: string) {
  const callback = safeAdminCallback(next);
  if (callback === "/admin") return "/admin/login";
  return `/admin/login?callbackUrl=${encodeURIComponent(callback)}`;
}

export { safeAdminCallback };
