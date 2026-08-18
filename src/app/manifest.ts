import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content";

// Sourced from content (MongoDB in production, placeholder fallback otherwise) so
// no real profile data is hardcoded in the repo. Using request-time content makes
// this route dynamic, which is fine for a manifest.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { profile } = await getSiteContent();
  const manifest = {
    name: `${profile.name} — ${profile.title}`,
    short_name: profile.name,
    description: profile.headline,
    start_url: "/",
    display: "standalone" as const,
    background_color: "#05070c",
    theme_color: "#05070c",
    icons: [{ src: "/logo-at.png", sizes: "150x150", type: "image/png" }],
    share_target: {
      action: "/admin/apply",
      method: "GET",
      enctype: "application/x-www-form-urlencoded",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  };
  return manifest as MetadataRoute.Manifest;
}
