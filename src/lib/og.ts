import { cloudinaryShareUrl } from "@/lib/cloudinary";

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
