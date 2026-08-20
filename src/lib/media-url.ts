import type { Profile, Project, ProjectScreenshot, Social } from "@/types/content";

function cloudName() {
  const url = process.env.CLOUDINARY_URL ?? "";
  const match = url.match(/^cloudinary:\/\/[^:]+:[^@]+@([^/]+)/);
  return (match?.[1] || process.env.CLOUDINARY_CLOUD_NAME || "").trim();
}

export function publicIdFromLocalPath(src: string) {
  if (!src.startsWith("/")) return undefined;
  const withoutExt = src.replace(/^\//, "").replace(/\.[a-z0-9]+$/i, "");
  if (withoutExt.startsWith("projects/")) return `portfolio/${withoutExt}`;
  return withoutExt;
}

export function resolveMediaUrl(src?: string, publicId?: string) {
  if (!src) return undefined;
  if (src.startsWith("https://") || src.startsWith("http://")) return src;
  const cloud = cloudName();
  if (!cloud) return src;
  const id = publicId || publicIdFromLocalPath(src);
  if (!id) return src;
  const resource = /\.(mp4|webm|mov)$/i.test(src) ? "video" : "image";
  return `https://res.cloudinary.com/${cloud}/${resource}/upload/${id}`;
}

function rewriteShot(shot: ProjectScreenshot): ProjectScreenshot {
  return {
    ...shot,
    src: resolveMediaUrl(shot.src, shot.publicId) ?? shot.src,
  };
}

export function profilePhotoSrc(profile: Profile, social?: Social) {
  const uploaded = resolveMediaUrl(profile.photoUrl, profile.photoPublicId);
  if (uploaded) return uploaded;
  const handle = social?.githubHandle?.replace(/^@/, "").trim();
  if (handle && handle !== "your-handle") return `https://github.com/${handle}.png?size=800`;
  return undefined;
}

export function rewriteProjectMedia(project: Project): Project {
  return {
    ...project,
    screenshots: project.screenshots?.map(rewriteShot),
    iosScreenshots: project.iosScreenshots?.map(rewriteShot),
    androidScreenshots: project.androidScreenshots?.map(rewriteShot),
    logo: resolveMediaUrl(project.logo, project.logoPublicId) ?? project.logo,
    banner: resolveMediaUrl(project.banner, project.bannerPublicId) ?? project.banner,
    video: resolveMediaUrl(project.video, project.videoPublicId) ?? project.video,
    ogImage: resolveMediaUrl(project.ogImage, project.ogImagePublicId) ?? project.ogImage,
  };
}

const SRCSET_WIDTHS = [240, 480, 720, 1080, 1440] as const;

function capWidth(host: string, width: number) {
  const max = host.includes("googleusercontent.com") || host.endsWith(".mzstatic.com") ? 800 : 1600;
  return Math.max(16, Math.min(max, Math.round(width)));
}

function cloudinarySized(src: string, width: number) {
  const marker = "/upload/";
  const index = src.indexOf(marker);
  if (index < 0) return src;
  const before = src.slice(0, index + marker.length);
  let after = src.slice(index + marker.length);
  const slash = after.indexOf("/");
  const first = slash >= 0 ? after.slice(0, slash) : after;
  const isVersion = /^v\d+$/.test(first);
  const isTransform = !isVersion && /(?:^|,)(?:f_|q_|w_|h_|c_|g_|dpr_|e_)/.test(first);
  if (isTransform) after = slash >= 0 ? after.slice(slash + 1) : "";
  return `${before}f_auto,q_auto:eco,c_limit,w_${width}/${after}`;
}

function playSized(src: string, width: number) {
  const base = src.replace(/=[^=]*$/, "");
  return `${base}=w${width}-rw`;
}

function appleSized(src: string, width: number) {
  if (/\/\d+x\d+[a-z]*\.(jpg|jpeg|png|webp)(?:\?.*)?$/i.test(src)) {
    return src.replace(/\/\d+x\d+[a-z]*\.(jpg|jpeg|png|webp)(?:\?.*)?$/i, `/${width}x0w.webp`);
  }
  return src;
}

export function optimizeImageUrl(src: string, width: number) {
  try {
    const url = new URL(src);
    const sized = capWidth(url.hostname, width);
    if (url.hostname === "res.cloudinary.com") return cloudinarySized(src, sized);
    if (url.hostname === "play-lh.googleusercontent.com" || url.hostname.endsWith(".googleusercontent.com")) {
      return playSized(src, sized);
    }
    if (url.hostname.endsWith(".mzstatic.com")) return appleSized(src, sized);
    if (url.hostname === "avatars.githubusercontent.com") {
      url.searchParams.set("s", String(sized));
      return url.toString();
    }
    if (url.hostname === "github.com" && url.pathname.endsWith(".png")) {
      url.searchParams.set("size", String(sized));
      return url.toString();
    }
  } catch {
    return src;
  }
  return src;
}

export function imageSrcSet(src: string, widths: readonly number[] = SRCSET_WIDTHS): string | undefined {
  try {
    const host = new URL(src).hostname;
    const seen = new Set<string>();
    const parts: string[] = [];
    for (const width of widths) {
      const url = optimizeImageUrl(src, width);
      if (seen.has(url)) continue;
      seen.add(url);
      parts.push(`${url} ${capWidth(host, width)}w`);
    }
    return parts.join(", ");
  } catch {
    return undefined;
  }
}
