import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/content";
import { siteUrlFrom } from "@/lib/seo";

const allowBots = [
  "*",
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Google-Extended",
  "Anthropic-AI",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "MistralAI-User",
  "DuckAssistBot",
  "Amazonbot",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
  "Meta-ExternalFetcher",
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "TelegramBot",
  "WhatsApp",
  "Discordbot",
];

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  const content = await getSiteContent();
  const siteUrl = siteUrlFrom(content);
  return {
    rules: allowBots.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: ["/admin", "/api/", "/projects/", "/_next/image"],
    })),
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
