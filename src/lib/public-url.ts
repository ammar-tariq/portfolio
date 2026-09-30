const BLOCKED_HOST_SUFFIXES = ["projectstagingzone.com", ".local"];

/** Public http(s) URL, or undefined when the value is empty, invalid, or a non-production host. */
export function publicHttpUrl(value: string | undefined | null): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return undefined;
    if (BLOCKED_HOST_SUFFIXES.some((suffix) => host === suffix.replace(/^\./, "") || host.endsWith(suffix))) {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}
