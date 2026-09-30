"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics-events";

export function ProjectView({ slug }: { slug: string }) {
  useEffect(() => {
    trackEvent("project_view", { project_slug: slug });
  }, [slug]);
  return null;
}
