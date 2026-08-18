"use server";

import { revalidateSite } from "@/lib/revalidate";
import { requireAdmin } from "@/lib/admin";
import { connectDb } from "@/lib/db";
import {
  ArchitectureModel,
  ExperienceModel,
  IndustryModel,
  OpenSourceModel,
  PrincipleModel,
  ProjectModel,
  SettingsModel,
  SkillCategoryModel,
} from "@/models";
import { slugify } from "@/lib/project-helpers";
import { destroyImage } from "@/lib/cloudinary";
import type { ArchitectureContent, Industry, Project, SiteSettings } from "@/types/content";
import { draftProjectWithGemini } from "@/lib/draft-project";
import { importProjectFromStoreUrls } from "@/lib/store-import";

async function ready() {
  await requireAdmin();
  await connectDb();
}

export async function draftProject(
  notes: string,
  industries: Industry[],
): Promise<{ ok: true; draft: Partial<Project> } | { ok: false; error: string }> {
  await requireAdmin();
  const text = notes.trim();
  if (text.length < 20) return { ok: false, error: "Paste a bit more detail (a short paragraph is enough)." };
  if (text.length > 8000) return { ok: false, error: "Keep notes under 8,000 characters." };
  try {
    const draft = await draftProjectWithGemini(text, industries);
    if (!draft.title) return { ok: false, error: "Draft was missing a title. Add the product name and try again." };
    return { ok: true, draft };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not draft the project.";
    return { ok: false, error: message };
  }
}

export async function importStoreProject(
  playUrl: string,
  appStoreUrl: string,
  industries: Industry[],
): Promise<{ ok: true; draft: Partial<Project>; notes: string; warning?: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const imported = await importProjectFromStoreUrls({
      playUrl,
      appStoreUrl,
      industries,
    });
    if (!imported.draft.title) return { ok: false, error: "Store listing did not include a title." };
    return { ok: true, ...imported };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import the store listing.";
    return { ok: false, error: message };
  }
}

export async function saveProject(raw: Project) {
  await ready();
  const slug = slugify(raw.slug || raw.title);
  if (!slug) throw new Error("Slug is required");
  const ogImage =
    raw.ogImage || raw.banner || raw.iosScreenshots?.[0]?.src || raw.androidScreenshots?.[0]?.src || raw.screenshots?.[0]?.src || raw.logo;
  const iosScreenshots = raw.iosScreenshots ?? [];
  const androidScreenshots = raw.androidScreenshots ?? [];
  const screenshots =
    iosScreenshots.length || androidScreenshots.length
      ? [...iosScreenshots, ...androidScreenshots]
      : (raw.screenshots ?? []);
  await ProjectModel.findOneAndUpdate(
    { slug },
    { ...raw, slug, ogImage, iosScreenshots, androidScreenshots, screenshots, listed: raw.listed !== false },
    { upsert: true, new: true },
  );
  revalidateSite(slug);
  return slug;
}

export async function setProjectFeatured(slug: string, featured: boolean) {
  await ready();
  await ProjectModel.findOneAndUpdate({ slug }, { featured });
  revalidateSite(slug);
}

export async function deleteProject(slug: string) {
  await ready();
  const project = await ProjectModel.findOne({ slug }).lean();
  if (project) {
    const media = project as {
      screenshots?: { publicId?: string }[];
      iosScreenshots?: { publicId?: string }[];
      androidScreenshots?: { publicId?: string }[];
      logoPublicId?: string;
      bannerPublicId?: string;
      ogImagePublicId?: string;
      videoPublicId?: string;
    };
    const shots = [
      ...(media.screenshots ?? []),
      ...(media.iosScreenshots ?? []),
      ...(media.androidScreenshots ?? []),
    ];
    for (const shot of shots) await destroyImage(shot.publicId);
    await destroyImage(media.logoPublicId);
    await destroyImage(media.bannerPublicId);
    await destroyImage(media.ogImagePublicId);
    await destroyImage(media.videoPublicId, "video");
  }
  await ProjectModel.deleteOne({ slug });
  revalidateSite(slug);
}

export async function saveExperience(raw: Record<string, unknown>) {
  await ready();
  const id = String(raw.id || slugify(String(raw.company ?? "role")));
  await ExperienceModel.findOneAndUpdate({ id }, { ...raw, id }, { upsert: true });
  revalidateSite();
}

export async function deleteExperience(id: string) {
  await ready();
  await ExperienceModel.deleteOne({ id });
  revalidateSite();
}

export async function saveSkill(raw: Record<string, unknown>) {
  await ready();
  const id = String(raw.id || slugify(String(raw.label ?? "skill")));
  await SkillCategoryModel.findOneAndUpdate({ id }, { ...raw, id }, { upsert: true });
  revalidateSite();
}

export async function deleteSkill(id: string) {
  await ready();
  await SkillCategoryModel.deleteOne({ id });
  revalidateSite();
}

export async function savePrinciple(raw: Record<string, unknown>) {
  await ready();
  const id = String(raw.id || slugify(String(raw.title ?? "principle")));
  await PrincipleModel.findOneAndUpdate({ id }, { ...raw, id }, { upsert: true });
  revalidateSite();
}

export async function deletePrinciple(id: string) {
  await ready();
  await PrincipleModel.deleteOne({ id });
  revalidateSite();
}

export async function saveIndustry(raw: { id: string; label: string; sortOrder?: number }) {
  await ready();
  const id = slugify(raw.id || raw.label);
  await IndustryModel.findOneAndUpdate({ id }, { ...raw, id }, { upsert: true });
  revalidateSite();
}

export async function deleteIndustry(id: string) {
  await ready();
  await IndustryModel.deleteOne({ id });
  revalidateSite();
}

export async function saveOpenSource(raw: Record<string, unknown>) {
  await ready();
  const slug = slugify(String(raw.slug || raw.title || "repo"));
  await OpenSourceModel.findOneAndUpdate({ slug }, { ...raw, slug }, { upsert: true });
  revalidateSite();
}

export async function deleteOpenSource(slug: string) {
  await ready();
  await OpenSourceModel.deleteOne({ slug });
  revalidateSite();
}

export async function saveSettings(raw: SiteSettings) {
  await ready();
  await SettingsModel.findByIdAndUpdate("site", { _id: "site", ...raw }, { upsert: true });
  revalidateSite();
}

export async function saveArchitecture(raw: ArchitectureContent) {
  await ready();
  await ArchitectureModel.findByIdAndUpdate("architecture", { _id: "architecture", ...raw }, { upsert: true });
  revalidateSite();
}
