"use server";

import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate";
import { requireAdmin } from "@/lib/admin";
import { connectDb } from "@/lib/db";
import {
  ArchitectureModel,
  ExperienceModel,
  IndustryModel,
  JobApplicationModel,
  OpenSourceModel,
  PrincipleModel,
  ProjectModel,
  SettingsModel,
  SkillCategoryModel,
} from "@/models";
import { slugify } from "@/lib/project-helpers";
import { destroyImage } from "@/lib/cloudinary";
import type { ArchitectureContent, Industry, Project, SiteSettings } from "@/types/content";
import { draftProjectWithGemini, rewriteProjectFieldWithGemini, type ProjectCopyField } from "@/lib/draft-project";
import { importProjectFromStoreUrls } from "@/lib/store-import";
import {
  importOpenSourceOwnerFromGithub,
  importOpenSourceRepoFromGithub,
  importProjectFromGithubRepo,
} from "@/lib/github-import";
import { getSiteContentForParams } from "@/lib/content";
import {
  applicationFromDoc,
  destroyApplicationFiles,
  generateApplicationMaterials,
  generateScreeningAnswers,
  uploadApplicationFiles,
} from "@/lib/job-application";
import type { ApplicationStatus } from "@/types/application";

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

export async function rewriteProjectField(
  field: ProjectCopyField,
  project: Partial<Project>,
  notes?: string,
): Promise<{ ok: true; value: string | string[] } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const value = await rewriteProjectFieldWithGemini({ field, project, notes });
    return { ok: true, value };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not rewrite that field.";
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

export async function importGithubProject(
  repoUrl: string,
  industries: Industry[],
): Promise<{ ok: true; draft: Partial<Project> } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const draft = await importProjectFromGithubRepo(repoUrl, industries);
    if (!draft.title) return { ok: false, error: "GitHub repo import did not return a project title." };
    return { ok: true, draft };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import the GitHub repo.";
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

export async function importOpenSourceRepo(repoUrl: string): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  await ready();
  try {
    const draft = await importOpenSourceRepoFromGithub(repoUrl);
    await OpenSourceModel.findOneAndUpdate({ slug: draft.slug }, draft, { upsert: true, new: true });
    revalidateSite();
    return { ok: true, slug: draft.slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import the GitHub repo.";
    return { ok: false, error: message };
  }
}

export async function importOpenSourceOwner(
  owner: string,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  await ready();
  try {
    const repos = await importOpenSourceOwnerFromGithub(owner);
    for (const [index, repo] of repos.entries()) {
      await OpenSourceModel.findOneAndUpdate(
        { slug: repo.slug },
        { ...repo, sortOrder: index },
        { upsert: true, new: true },
      );
    }
    revalidateSite();
    return { ok: true, count: repos.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import repos from GitHub.";
    return { ok: false, error: message };
  }
}

export async function syncOpenSource(slug: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await ready();
  const existing = await OpenSourceModel.findOne({ slug }).lean();
  if (!existing?.repoUrl) return { ok: false, error: "This item does not have a GitHub repo URL to sync from." };
  try {
    const draft = await importOpenSourceRepoFromGithub(String(existing.repoUrl));
    await OpenSourceModel.findOneAndUpdate(
      { slug },
      {
        ...draft,
        demoUrl: existing.demoUrl || draft.demoUrl,
        demoLabel: existing.demoLabel || draft.demoLabel,
        sortOrder: typeof existing.sortOrder === "number" ? existing.sortOrder : 0,
      },
      { upsert: true, new: true },
    );
    revalidateSite();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not sync this repo.";
    return { ok: false, error: message };
  }
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

function revalidateApplications(id?: string) {
  revalidatePath("/admin/applications");
  if (id) revalidatePath(`/admin/applications/${id}`);
}

export async function generateJobApplication(input: {
  company: string;
  role: string;
  jobUrl?: string;
  location?: string;
  jd: string;
  aboutCompany?: string;
  extraQuestions?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await ready();
  try {
    const content = await getSiteContentForParams();
    const generated = await generateApplicationMaterials({
      content,
      company: input.company,
      role: input.role,
      jobUrl: input.jobUrl,
      location: input.location,
      jd: input.jd,
      aboutCompany: input.aboutCompany,
      extraQuestions: input.extraQuestions,
    });
    const created = await JobApplicationModel.create({
      company: input.company.trim(),
      role: input.role.trim(),
      jobUrl: input.jobUrl?.trim() || undefined,
      location: input.location?.trim() || undefined,
      jd: input.jd.trim(),
      aboutCompany: input.aboutCompany?.trim() || "",
      extraQuestions: input.extraQuestions?.trim() || "",
      keywords: generated.keywords,
      resume: generated.resume,
      coverLetter: generated.coverLetter,
      answers: generated.answers,
      status: "draft",
    });
    const id = String(created._id);
    const application = applicationFromDoc(created);
    const uploaded = await uploadApplicationFiles(id, content, application);
    created.files = uploaded.files;
    created.warning = uploaded.warning;
    await created.save();
    revalidateApplications(id);
    return { ok: true, id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate the application.";
    return { ok: false, error: message };
  }
}

export async function answerApplicationQuestions(
  id: string,
  questions: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await ready();
  try {
    const doc = await JobApplicationModel.findById(id);
    if (!doc) return { ok: false, error: "Application not found." };
    const content = await getSiteContentForParams();
    const existing = applicationFromDoc(doc);
    const answers = await generateScreeningAnswers({ content, application: existing, questions });
    const dated = answers.map((item) => ({ ...item, createdAt: new Date() }));
    doc.extraQuestions = [String(doc.extraQuestions || "").trim(), questions.trim()].filter(Boolean).join("\n\n");
    doc.answers = [...(doc.answers ?? []), ...dated];
    const updated = applicationFromDoc(doc);
    const uploaded = await uploadApplicationFiles(id, content, updated);
    doc.files = uploaded.files;
    doc.warning = uploaded.warning;
    await doc.save();
    revalidateApplications(id);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not answer those questions.";
    return { ok: false, error: message };
  }
}

export async function setApplicationStatus(id: string, status: ApplicationStatus) {
  await ready();
  await JobApplicationModel.findByIdAndUpdate(id, { status });
  revalidateApplications(id);
}

export async function deleteJobApplication(id: string) {
  await ready();
  const doc = await JobApplicationModel.findById(id).lean();
  if (doc) {
    await destroyApplicationFiles(applicationFromDoc(doc).files);
  }
  await JobApplicationModel.deleteOne({ _id: id });
  revalidateApplications();
}
