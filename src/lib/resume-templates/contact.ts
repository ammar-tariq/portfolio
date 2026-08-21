import type { Profile, Social } from "@/types/content";
import type { ResumeContactParts } from "./types";

/** Strip protocol / www so contact lines stay short and ATS-readable. */
export function displayUrl(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

export function resumeContactParts(profile: Profile, social: Social): ResumeContactParts {
  const website = profile.website || social.website;
  return {
    email: profile.email?.trim() || undefined,
    phone: profile.phone?.trim() || undefined,
    linkedin: social.linkedin?.trim() ? displayUrl(social.linkedin) : undefined,
    website: website?.trim() ? displayUrl(website) : undefined,
  };
}

/** Fixed order: email · phone · LinkedIn · website. Omits empty slots. */
export function resumeContactItems(parts: ResumeContactParts): string[] {
  return [parts.email, parts.phone, parts.linkedin, parts.website].filter(
    (item): item is string => Boolean(item),
  );
}

export function resumeContactLine(parts: ResumeContactParts, separator = "  ·  ") {
  return resumeContactItems(parts).join(separator);
}
