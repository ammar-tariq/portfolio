export type AnalyticsEvent =
  | "contact_click"
  | "email_click"
  | "linkedin_click"
  | "github_click"
  | "resume_click"
  | "resume_download"
  | "project_view"
  | "hire_me_click";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Queue a GA4/GTM event. Safe when analytics has not loaded yet. */
export function trackEvent(name: AnalyticsEvent, params?: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }
  window.gtag("event", name, params ?? {});
}

export function eventForContactChannel(id: string): AnalyticsEvent {
  switch (id) {
    case "email":
      return "email_click";
    case "linkedin":
      return "linkedin_click";
    case "github":
      return "github_click";
    case "resume":
      return "resume_click";
    default:
      return "contact_click";
  }
}
