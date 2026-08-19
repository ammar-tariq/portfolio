import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function BlogPage() {
  const content = await getSiteContent();
  redirect(content.social.medium || "/");
}
