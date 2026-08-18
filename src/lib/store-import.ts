import gplay from "google-play-scraper";
import { hasCloudinary, hasGemini } from "@/lib/env";
import { slugify } from "@/lib/project-helpers";
import { uploadImage } from "@/lib/cloudinary";
import { draftProjectWithGemini } from "@/lib/draft-project";
import type { Industry, Project, ProjectScreenshot } from "@/types/content";

const PLAY_HOST = "play.google.com";
const APPLE_HOSTS = new Set(["apps.apple.com", "itunes.apple.com"]);
const IMAGE_HOSTS = [/^play-lh\.googleusercontent\.com$/i, /(^|\.)mzstatic\.com$/i];
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

type StoreListing = {
  title: string;
  summary: string;
  description: string;
  icon?: string;
  banner?: string;
  video?: string;
  iosScreenshots: string[];
  androidScreenshots: string[];
  year?: string;
  genre?: string;
  playUrl?: string;
  appStoreUrl?: string;
};

function uniqueUrls(urls: string[], max = 8) {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const url of urls) {
    if (!url) continue;
    const key = url.split("?")[0].split("=")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(url);
    if (unique.length >= max) break;
  }
  return unique;
}

function isEmbedVideo(url?: string) {
  if (!url) return false;
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

function parseHttpUrl(raw: string) {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

export function parsePlayAppId(raw: string) {
  const url = parseHttpUrl(raw);
  if (!url || url.hostname.replace(/^www\./, "") !== PLAY_HOST) return null;
  const id = url.searchParams.get("id")?.trim();
  if (!id || !/^[a-zA-Z0-9._]+$/.test(id)) return null;
  return id;
}

export function parseAppStoreId(raw: string) {
  const url = parseHttpUrl(raw);
  if (!url || !APPLE_HOSTS.has(url.hostname.replace(/^www\./, ""))) return null;
  const match = url.pathname.match(/\/id(\d+)/) ?? url.searchParams.get("id")?.match(/^(\d+)$/);
  const id = match?.[1];
  return id ?? null;
}

function yearFrom(value?: string) {
  const match = value?.match(/(20\d{2}|19\d{2})/);
  return match?.[1];
}

function applicationCategory(genre?: string) {
  const value = (genre ?? "").toLowerCase();
  if (value.includes("business") || value.includes("productivity")) return "BusinessApplication";
  if (value.includes("finance")) return "FinanceApplication";
  if (value.includes("health")) return "HealthApplication";
  if (value.includes("music") || value.includes("entertainment") || value.includes("photo") || value.includes("video")) {
    return "EntertainmentApplication";
  }
  if (value.includes("travel")) return "TravelApplication";
  if (value.includes("shop")) return "ShoppingApplication";
  if (value.includes("social")) return "SocialNetworkingApplication";
  return "MobileApplication";
}

function isAllowedImageHost(hostname: string) {
  return IMAGE_HOSTS.some((pattern) => pattern.test(hostname));
}

function sizedImageUrl(url: string) {
  if (url.includes("play-lh.googleusercontent.com") && !url.includes("=")) return `${url}=w1280`;
  return url;
}

async function fetchPlay(playUrl: string): Promise<StoreListing> {
  const appId = parsePlayAppId(playUrl);
  if (!appId) throw new Error("Play Store URL must look like https://play.google.com/store/apps/details?id=com.example.app");
  const app = await gplay.app({ appId, lang: "en", country: "us" });
  return {
    title: app.title,
    summary: app.summary ?? "",
    description: app.description ?? app.summary ?? "",
    icon: app.icon,
    banner: app.headerImage,
    video: app.video,
    iosScreenshots: [],
    androidScreenshots: uniqueUrls(app.screenshots ?? []),
    year: yearFrom(app.released),
    genre: app.genre,
    playUrl: `https://play.google.com/store/apps/details?id=${appId}`,
  };
}

async function fetchAppStore(appStoreUrl: string): Promise<StoreListing> {
  const id = parseAppStoreId(appStoreUrl);
  if (!id) throw new Error("App Store URL must look like https://apps.apple.com/app/name/id123456789");
  const response = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=software`, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`App Store lookup failed (${response.status})`);
  const body = (await response.json()) as {
    results?: {
      trackName?: string;
      description?: string;
      artworkUrl512?: string;
      artworkUrl100?: string;
      screenshotUrls?: string[];
      primaryGenreName?: string;
      releaseDate?: string;
      trackViewUrl?: string;
    }[];
  };
  const app = body.results?.[0];
  if (!app?.trackName) throw new Error("App Store listing was not found. Check the URL.");
  return {
    title: app.trackName,
    summary: (app.description ?? "").split("\n").find((line) => line.trim()) ?? app.trackName,
    description: app.description ?? "",
    icon: app.artworkUrl512 ?? app.artworkUrl100,
    iosScreenshots: uniqueUrls(app.screenshotUrls ?? []),
    androidScreenshots: [],
    year: yearFrom(app.releaseDate),
    genre: app.primaryGenreName,
    appStoreUrl: app.trackViewUrl?.split("?")[0] ?? `https://apps.apple.com/app/id${id}`,
  };
}

function mergeListings(play?: StoreListing, apple?: StoreListing): StoreListing {
  if (!play && !apple) throw new Error("Add a Play Store URL, an App Store URL, or both.");
  const title = apple?.title || play?.title || "Untitled";
  const description = (apple?.description?.length ?? 0) >= (play?.description?.length ?? 0)
    ? apple?.description || play?.description || ""
    : play?.description || apple?.description || "";
  return {
    title,
    summary: play?.summary || apple?.summary || "",
    description,
    icon: apple?.icon || play?.icon,
    banner: play?.banner || apple?.banner,
    video: play?.video || apple?.video,
    iosScreenshots: uniqueUrls(apple?.iosScreenshots ?? []),
    androidScreenshots: uniqueUrls(play?.androidScreenshots ?? []),
    year: apple?.year || play?.year,
    genre: play?.genre || apple?.genre,
    playUrl: play?.playUrl,
    appStoreUrl: apple?.appStoreUrl,
  };
}

async function fetchAllowedImage(url: string) {
  const parsed = new URL(url);
  if (!isAllowedImageHost(parsed.hostname)) {
    throw new Error(`Blocked image host: ${parsed.hostname}`);
  }
  const response = await fetch(sizedImageUrl(url), {
    headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
    signal: AbortSignal.timeout(20000),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Could not download image (${response.status})`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > 8 * 1024 * 1024) throw new Error("Store image is larger than 8MB");
  return buffer;
}

async function uploadShotList(urls: string[], folder: string, prefix: string, title: string) {
  const shots: ProjectScreenshot[] = [];
  for (const [index, url] of urls.entries()) {
    try {
      const buffer = await fetchAllowedImage(url);
      const uploaded = await uploadImage({ buffer, folder, filename: `${prefix}-${index + 1}` });
      shots.push({
        src: uploaded.url,
        publicId: uploaded.publicId,
        alt: `${title} ${prefix} screenshot ${index + 1}`,
      });
    } catch (error) {
      console.error(`store import ${prefix}`, error);
    }
  }
  return shots;
}

async function uploadStoreImages(listing: StoreListing, folder: string) {
  if (!hasCloudinary()) {
    return {
      iosScreenshots: [] as ProjectScreenshot[],
      androidScreenshots: [] as ProjectScreenshot[],
      logo: undefined as { url: string; publicId: string } | undefined,
      banner: undefined as { url: string; publicId: string } | undefined,
      skipped: true,
    };
  }

  let logo: { url: string; publicId: string } | undefined;
  let banner: { url: string; publicId: string } | undefined;

  if (listing.icon) {
    try {
      const buffer = await fetchAllowedImage(listing.icon);
      logo = await uploadImage({ buffer, folder, filename: "logo" });
    } catch (error) {
      console.error("store import logo", error);
    }
  }

  if (listing.banner) {
    try {
      const buffer = await fetchAllowedImage(listing.banner);
      banner = await uploadImage({ buffer, folder, filename: "banner" });
    } catch (error) {
      console.error("store import banner", error);
    }
  }

  const [iosScreenshots, androidScreenshots] = await Promise.all([
    uploadShotList(listing.iosScreenshots, folder, "ios", listing.title),
    uploadShotList(listing.androidScreenshots, folder, "android", listing.title),
  ]);

  return { iosScreenshots, androidScreenshots, logo, banner, skipped: false };
}

function listingNotes(listing: StoreListing) {
  return [
    `Imported from app store listing(s) for ${listing.title}.`,
    listing.playUrl ? `Play Store: ${listing.playUrl}` : "",
    listing.appStoreUrl ? `App Store: ${listing.appStoreUrl}` : "",
    listing.year ? `Year: ${listing.year}` : "",
    listing.genre ? `Genre: ${listing.genre}` : "",
    listing.summary ? `Summary: ${listing.summary}` : "",
    "",
    listing.description.slice(0, 5000),
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function baseDraft(listing: StoreListing): Partial<Project> {
  const title = listing.title.replace(/\s+[-–:].+$/, "").trim() || listing.title;
  return {
    title,
    slug: slugify(title),
    seoLabel: title,
    seoDescription: (listing.summary || listing.description).replace(/\s+/g, " ").slice(0, 160),
    tagline: listing.summary.slice(0, 180),
    description: listing.description.replace(/\s+/g, " ").slice(0, 1200),
    role: "React Native engineer",
    year: listing.year,
    status: "shipped",
    liveUrl: listing.playUrl,
    liveLabel: listing.playUrl ? "Play Store" : undefined,
    appStoreUrl: listing.appStoreUrl,
    applicationCategory: applicationCategory(listing.genre),
    visual: "frame",
  };
}

export async function importProjectFromStoreUrls(input: {
  playUrl?: string;
  appStoreUrl?: string;
  industries: Industry[];
}): Promise<{ draft: Partial<Project>; notes: string; warning?: string }> {
  const playUrl = input.playUrl?.trim();
  const appStoreUrl = input.appStoreUrl?.trim();
  if (!playUrl && !appStoreUrl) {
    throw new Error("Paste a Play Store URL, an App Store URL, or both.");
  }

  const errors: string[] = [];
  const [play, apple] = await Promise.all([
    playUrl
      ? fetchPlay(playUrl).catch((error: unknown) => {
          errors.push(error instanceof Error ? error.message : "Play Store import failed");
          return undefined;
        })
      : Promise.resolve(undefined),
    appStoreUrl
      ? fetchAppStore(appStoreUrl).catch((error: unknown) => {
          errors.push(error instanceof Error ? error.message : "App Store import failed");
          return undefined;
        })
      : Promise.resolve(undefined),
  ]);

  if (!play && !apple) {
    throw new Error(errors.join(" ") || "Could not read those store listings.");
  }

  const listing = mergeListings(play, apple);
  listing.playUrl = listing.playUrl ?? (playUrl && parsePlayAppId(playUrl)
    ? `https://play.google.com/store/apps/details?id=${parsePlayAppId(playUrl)}`
    : undefined);
  listing.appStoreUrl = listing.appStoreUrl ?? (appStoreUrl && parseAppStoreId(appStoreUrl)
    ? `https://apps.apple.com/app/id${parseAppStoreId(appStoreUrl)}`
    : undefined);

  const notes = listingNotes(listing);
  let draft = baseDraft(listing);
  if (hasGemini()) {
    try {
      const polished = await draftProjectWithGemini(
        `${notes}\n\nKeep liveUrl and appStoreUrl exactly as given. Do not invent GitHub or web URLs.`,
        input.industries,
      );
      draft = {
        ...draft,
        ...polished,
        liveUrl: listing.playUrl,
        liveLabel: listing.playUrl ? "Play Store" : polished.liveLabel,
        appStoreUrl: listing.appStoreUrl,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Gemini polish failed; used store copy.");
    }
  }

  const folder = `portfolio/projects/${draft.slug || slugify(listing.title) || "import"}`;
  const assets = await uploadStoreImages(listing, folder);
  draft.iosScreenshots = assets.iosScreenshots;
  draft.androidScreenshots = assets.androidScreenshots;
  draft.screenshots = [...assets.iosScreenshots, ...assets.androidScreenshots];
  if (assets.logo) {
    draft.logo = assets.logo.url;
    draft.logoPublicId = assets.logo.publicId;
  }
  if (assets.banner) {
    draft.banner = assets.banner.url;
    draft.bannerPublicId = assets.banner.publicId;
    draft.ogImage = assets.banner.url;
    draft.ogImagePublicId = assets.banner.publicId;
  } else if (assets.logo) {
    draft.ogImage = assets.logo.url;
    draft.ogImagePublicId = assets.logo.publicId;
  }
  if (listing.video && isEmbedVideo(listing.video)) {
    draft.videoUrl = listing.video;
  }

  const expectedShots = listing.iosScreenshots.length + listing.androidScreenshots.length;
  const uploadedShots = assets.iosScreenshots.length + assets.androidScreenshots.length;
  if (assets.skipped) errors.push("Cloudinary is not configured, so images were skipped.");
  else if (!uploadedShots && expectedShots) {
    errors.push("Store copy imported, but screenshots could not be uploaded.");
  }

  return {
    draft,
    notes,
    warning: errors.length ? errors.join(" ") : undefined,
  };
}
