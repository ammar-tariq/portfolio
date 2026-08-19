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
