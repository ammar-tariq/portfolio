import type { Project, ProjectScreenshot } from "@/types/content";

export function shotsOf(list?: ProjectScreenshot[]) {
  return (list ?? []).filter((shot) => shot.src);
}

export function iosScreenshots(project: Project) {
  return shotsOf(project.iosScreenshots);
}

export function androidScreenshots(project: Project) {
  return shotsOf(project.androidScreenshots);
}

export function fallbackScreenshots(project: Project) {
  if (iosScreenshots(project).length || androidScreenshots(project).length) return [];
  return shotsOf(project.screenshots);
}

export function allScreenshots(project: Project) {
  const ios = iosScreenshots(project);
  const android = androidScreenshots(project);
  if (ios.length || android.length) return [...ios, ...android];
  return shotsOf(project.screenshots);
}

export function coverImage(project: Project) {
  return (
    project.ogImage ||
    project.banner ||
    allScreenshots(project)[0]?.src ||
    project.logo
  );
}

export function youtubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return match?.[1];
}

export function vimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1];
}

export function videoEmbedSrc(project: Project) {
  for (const raw of [project.videoUrl, project.video]) {
    const url = raw?.trim();
    if (!url) continue;
    const yt = youtubeId(url);
    if (yt) return `https://www.youtube-nocookie.com/embed/${yt}`;
    const vimeo = vimeoId(url);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo}`;
  }
  return undefined;
}

export function hostedVideoSrc(project: Project) {
  for (const raw of [project.video, project.videoUrl]) {
    const url = raw?.trim();
    if (!url) continue;
    if (youtubeId(url) || vimeoId(url)) continue;
    return url;
  }
  return undefined;
}
