import { cloudinaryOgPortraitUrl, cloudinaryShareUrl } from "@/lib/cloudinary";

export const OG_SIZE = { width: 1200, height: 630 };

export function absoluteUrl(pathOrUrl: string | undefined, siteUrl: string) {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${siteUrl.replace(/\/$/, "")}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function shareImageUrl(pathOrUrl: string | undefined, siteUrl: string) {
  const abs = absoluteUrl(pathOrUrl, siteUrl);
  if (!abs) return undefined;
  return cloudinaryShareUrl(abs);
}

export function ogImages(pathOrUrl: string | undefined, siteUrl: string, alt: string) {
  const url = shareImageUrl(pathOrUrl, siteUrl);
  if (!url) return undefined;
  return [
    {
      url,
      width: OG_SIZE.width,
      height: OG_SIZE.height,
      type: "image/jpeg",
      alt,
    },
  ];
}

export function ogPortraitUrl(src?: string) {
  if (!src) return undefined;
  return cloudinaryOgPortraitUrl(src);
}

export async function ogPortraitDataUrl(src?: string) {
  const url = ogPortraitUrl(src);
  if (!url) return undefined;
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return undefined;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.byteLength) return undefined;
    const mime = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return undefined;
  }
}
