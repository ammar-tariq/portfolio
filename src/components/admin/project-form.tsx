"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Industry, Project, ProjectScreenshot, ProjectVisual } from "@/types/content";
import { saveProject, draftProject, importStoreProject } from "@/app/admin/actions";
import { Field, LinesEditor, TextArea, TextInput, Toggle } from "./fields";
import { ImageUpload, MediaUpload } from "./image-upload";
import { slugify } from "@/lib/project-helpers";

const visuals: ProjectVisual[] = [
  "dojo",
  "glass",
  "signal",
  "frame",
  "hub",
  "map",
  "orbit",
  "horizon",
  "catalog",
];

const empty: Project = {
  slug: "",
  title: "",
  seoLabel: "",
  seoDescription: "",
  tagline: "",
  description: "",
  industries: [],
  role: "",
  year: "",
  status: "shipped",
  featured: false,
  listed: true,
  technologies: [],
  architecture: [],
  highlights: [],
  screenshots: [],
  iosScreenshots: [],
  androidScreenshots: [],
  visual: "orbit",
};

export function ProjectForm({
  initial,
  industries,
  canDraft = false,
}: {
  initial?: Project;
  industries: Industry[];
  canDraft?: boolean;
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project>(initial ?? empty);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [playUrl, setPlayUrl] = useState(initial?.liveUrl?.includes("play.google.com") ? initial.liveUrl : "");
  const [appStoreUrl, setAppStoreUrl] = useState(initial?.appStoreUrl ?? "");
  const [drafting, setDrafting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [draftError, setDraftError] = useState("");

  function update<K extends keyof Project>(key: K, value: Project[K]) {
    setProject((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const slug = await saveProject({
      ...project,
      slug: slugify(project.slug || project.title),
      seoLabel: project.seoLabel || project.title,
      seoDescription: project.seoDescription || project.tagline || project.description,
    });
    setSaving(false);
    router.push("/admin/projects");
    router.refresh();
    return slug;
  }

  function setShot(list: "iosScreenshots" | "androidScreenshots" | "screenshots", index: number, shot: ProjectScreenshot) {
    const screenshots = [...(project[list] ?? [])];
    screenshots[index] = shot;
    update(list, screenshots);
  }

  function folder() {
    return `portfolio/projects/${slugify(project.slug || project.title) || "draft"}`;
  }

  async function fillFromNotes() {
    setDrafting(true);
    setDraftError("");
    const result = await draftProject(notes, industries);
    setDrafting(false);
    if (!result.ok) {
      setDraftError(result.error);
      return;
    }
    setProject((current) => ({
      ...current,
      ...result.draft,
      screenshots: current.screenshots,
      iosScreenshots: current.iosScreenshots,
      androidScreenshots: current.androidScreenshots,
      logo: current.logo,
      logoPublicId: current.logoPublicId,
      banner: current.banner,
      bannerPublicId: current.bannerPublicId,
      video: current.video,
      videoPublicId: current.videoPublicId,
      videoUrl: current.videoUrl,
      ogImage: current.ogImage,
      ogImagePublicId: current.ogImagePublicId,
      featured: current.featured,
      listed: current.listed,
      sortOrder: current.sortOrder,
    }));
  }

  async function importFromStores() {
    setImporting(true);
    setDraftError("");
    const result = await importStoreProject(playUrl, appStoreUrl, industries);
    setImporting(false);
    if (!result.ok) {
      setDraftError(result.error);
      return;
    }
    if (result.notes) setNotes(result.notes);
    setProject((current) => ({
      ...current,
      ...result.draft,
      featured: current.featured,
      listed: current.listed,
      sortOrder: current.sortOrder,
      screenshots: result.draft.screenshots?.length ? result.draft.screenshots : current.screenshots,
      iosScreenshots: result.draft.iosScreenshots?.length ? result.draft.iosScreenshots : current.iosScreenshots,
      androidScreenshots: result.draft.androidScreenshots?.length
        ? result.draft.androidScreenshots
        : current.androidScreenshots,
      logo: result.draft.logo ?? current.logo,
      logoPublicId: result.draft.logoPublicId ?? current.logoPublicId,
      banner: result.draft.banner ?? current.banner,
      bannerPublicId: result.draft.bannerPublicId ?? current.bannerPublicId,
      video: result.draft.video ?? current.video,
      videoPublicId: result.draft.videoPublicId ?? current.videoPublicId,
      videoUrl: result.draft.videoUrl ?? current.videoUrl,
      ogImage: result.draft.ogImage ?? current.ogImage,
      ogImagePublicId: result.draft.ogImagePublicId ?? current.ogImagePublicId,
    }));
    if (result.warning) setDraftError(result.warning);
  }

  return (
    <div className="grid gap-8">
      <div className="rounded-3xl border border-line bg-bg-elevated/40 p-5">
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Import from stores</p>
        <p className="mt-2 text-sm text-muted">
          Paste a Play Store URL, an App Store URL, or both. Play Store fills Android screenshots, banner, and logo.
          App Store fills iOS screenshots and logo. Video URLs from the listing are kept when present.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Play Store URL">
            <TextInput
              value={playUrl}
              onChange={(event) => setPlayUrl(event.target.value)}
              placeholder="https://play.google.com/store/apps/details?id=…"
            />
          </Field>
          <Field label="App Store URL">
            <TextInput
              value={appStoreUrl}
              onChange={(event) => setAppStoreUrl(event.target.value)}
              placeholder="https://apps.apple.com/app/…/id…"
            />
          </Field>
        </div>
        <button
          type="button"
          disabled={importing || (!playUrl.trim() && !appStoreUrl.trim())}
          onClick={() => void importFromStores()}
          className="btn-solid mt-4 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium disabled:opacity-50"
        >
          {importing ? "Importing listing…" : "Import listing"}
        </button>
      </div>

      <div className="rounded-3xl border border-line bg-bg-elevated/40 p-5">
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Draft from notes</p>
        <p className="mt-2 text-sm text-muted">
          Paste a rough description, or use the store text after import. Gemini fills copy fields only — screenshots
          stay as they are.
        </p>
        <TextArea
          className="mt-4 min-h-36"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="e.g. Dating app for people who are busy during the week. React Native, Node, launched 2024 on iOS and Android. I built the matching flow and chat."
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={drafting || !canDraft}
            onClick={() => void fillFromNotes()}
            className="btn-solid inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium disabled:opacity-50"
          >
            {drafting ? "Drafting…" : "Fill form"}
          </button>
          {!canDraft ? (
            <p className="text-sm text-muted">Add GEMINI_API_KEY to .env (Google AI Studio free key), then restart dev.</p>
          ) : null}
        </div>
        {draftError ? <p className="mt-3 text-sm text-muted">{draftError}</p> : null}
      </div>

    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <TextInput value={project.title} onChange={(e) => update("title", e.target.value)} required />
        </Field>
        <Field label="Slug">
          <TextInput
            value={project.slug}
            placeholder={slugify(project.title)}
            onChange={(e) => update("slug", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Tagline">
        <TextInput value={project.tagline} onChange={(e) => update("tagline", e.target.value)} />
      </Field>
      <Field label="Description">
        <TextArea value={project.description} onChange={(e) => update("description", e.target.value)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO label">
          <TextInput value={project.seoLabel} onChange={(e) => update("seoLabel", e.target.value)} />
        </Field>
        <Field label="SEO description">
          <TextArea value={project.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Role">
          <TextInput value={project.role} onChange={(e) => update("role", e.target.value)} />
        </Field>
        <Field label="Year">
          <TextInput value={project.year ?? ""} onChange={(e) => update("year", e.target.value)} />
        </Field>
        <Field label="Status">
          <select
            value={project.status ?? "shipped"}
            onChange={(e) => update("status", e.target.value as Project["status"])}
            className="w-full rounded-2xl border border-line bg-bg-elevated px-4 py-3 text-sm"
          >
            <option value="shipped">Shipped</option>
            <option value="active">Active</option>
            <option value="internal">Internal</option>
          </select>
        </Field>
      </div>
      <div className="flex flex-wrap gap-4">
        <Toggle
          label="Featured on homepage"
          checked={Boolean(project.featured)}
          onChange={(v) => update("featured", v)}
        />
        <Toggle
          label="Listed in View all"
          checked={project.listed !== false}
          onChange={(v) => update("listed", v)}
        />
      </div>
      <Field label="Industries">
        <div className="flex flex-wrap gap-2">
          {industries.map((industry) => {
            const selected = project.industries.includes(industry.id);
            return (
              <button
                key={industry.id}
                type="button"
                onClick={() =>
                  update(
                    "industries",
                    selected
                      ? project.industries.filter((id) => id !== industry.id)
                      : [...project.industries, industry.id],
                  )
                }
                className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase ${
                  selected ? "border-accent text-accent" : "border-line text-muted"
                }`}
              >
                {industry.label}
              </button>
            );
          })}
        </div>
      </Field>
      <LinesEditor
        label="Technologies"
        value={project.technologies}
        onChange={(value) => update("technologies", value.filter(Boolean))}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Live URL">
          <TextInput value={project.liveUrl ?? ""} onChange={(e) => update("liveUrl", e.target.value)} />
        </Field>
        <Field label="Live label">
          <TextInput value={project.liveLabel ?? ""} onChange={(e) => update("liveLabel", e.target.value)} />
        </Field>
        <Field label="App Store URL">
          <TextInput value={project.appStoreUrl ?? ""} onChange={(e) => update("appStoreUrl", e.target.value)} />
        </Field>
        <Field label="Web URL">
          <TextInput value={project.webUrl ?? ""} onChange={(e) => update("webUrl", e.target.value)} />
        </Field>
        <Field label="GitHub">
          <TextInput value={project.github ?? ""} onChange={(e) => update("github", e.target.value)} />
        </Field>
        <Field label="Application category">
          <TextInput
            value={project.applicationCategory ?? ""}
            onChange={(e) => update("applicationCategory", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Challenge">
        <TextArea value={project.challenge ?? ""} onChange={(e) => update("challenge", e.target.value)} />
      </Field>
      <Field label="Solution">
        <TextArea value={project.solution ?? ""} onChange={(e) => update("solution", e.target.value)} />
      </Field>
      <LinesEditor label="Architecture" value={project.architecture} onChange={(v) => update("architecture", v.filter(Boolean))} />
      <LinesEditor
        label="Engineering"
        value={project.engineering ?? []}
        onChange={(v) => update("engineering", v.filter(Boolean))}
      />
      <Field label="Outcome">
        <TextArea value={project.outcome ?? ""} onChange={(e) => update("outcome", e.target.value)} />
      </Field>
      <LinesEditor label="Highlights" value={project.highlights} onChange={(v) => update("highlights", v.filter(Boolean))} />
      <Field label="Visual">
        <select
          value={project.visual}
          onChange={(e) => update("visual", e.target.value as ProjectVisual)}
          className="w-full rounded-2xl border border-line bg-bg-elevated px-4 py-3 text-sm"
        >
          {visuals.map((visual) => (
            <option key={visual} value={visual}>
              {visual}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-6 rounded-3xl border border-line p-5">
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Media</p>
        <div className="grid gap-4 md:grid-cols-2">
          <ImageUpload
            label="Logo"
            folder={folder()}
            value={project.logo}
            onUploaded={(asset) => {
              update("logo", asset.url);
              update("logoPublicId", asset.publicId);
            }}
            onUrl={(url) => {
              update("logo", url);
              update("logoPublicId", undefined);
            }}
          />
          <ImageUpload
            label="Banner"
            folder={folder()}
            value={project.banner}
            onUploaded={(asset) => {
              update("banner", asset.url);
              update("bannerPublicId", asset.publicId);
              if (!project.ogImage) {
                update("ogImage", asset.url);
                update("ogImagePublicId", asset.publicId);
              }
            }}
            onUrl={(url) => {
              update("banner", url);
              update("bannerPublicId", undefined);
            }}
          />
        </div>
        <Field label="Video URL (YouTube, Vimeo, or mp4)">
          <TextInput
            value={project.videoUrl ?? ""}
            placeholder="https://www.youtube.com/watch?v=… or https://…/promo.mp4"
            onChange={(e) => update("videoUrl", e.target.value)}
          />
        </Field>
        <MediaUpload
          label="Or upload / paste a video file URL"
          kind="video"
          folder={folder()}
          value={project.video}
          onUploaded={(asset) => {
            update("video", asset.url);
            update("videoPublicId", asset.publicId);
          }}
          onUrl={(url) => {
            update("video", url);
            update("videoPublicId", undefined);
          }}
        />
        <ScreenshotList
          title="iOS screenshots"
          folder={folder()}
          shots={project.iosScreenshots ?? []}
          onChange={(shots) => update("iosScreenshots", shots)}
          onShot={(index, shot) => setShot("iosScreenshots", index, shot)}
        />
        <ScreenshotList
          title="Android screenshots"
          folder={folder()}
          shots={project.androidScreenshots ?? []}
          onChange={(shots) => update("androidScreenshots", shots)}
          onShot={(index, shot) => setShot("androidScreenshots", index, shot)}
        />
        {!(project.iosScreenshots?.length || project.androidScreenshots?.length) && (project.screenshots?.length ?? 0) > 0 ? (
          <ScreenshotList
            title="Screenshots"
            folder={folder()}
            shots={project.screenshots ?? []}
            onChange={(shots) => update("screenshots", shots)}
            onShot={(index, shot) => setShot("screenshots", index, shot)}
          />
        ) : null}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="btn-solid inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium"
      >
        {saving ? "Saving…" : "Save project"}
      </button>
    </form>
    </div>
  );
}

function ScreenshotList({
  title,
  folder,
  shots,
  onChange,
  onShot,
}: {
  title: string;
  folder: string;
  shots: ProjectScreenshot[];
  onChange: (shots: ProjectScreenshot[]) => void;
  onShot: (index: number, shot: ProjectScreenshot) => void;
}) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">{title}</p>
      <div className="mt-3 grid gap-4">
        {shots.map((shot, index) => (
          <div key={`${shot.src}-${index}`} className="grid gap-3 rounded-2xl border border-line p-4 md:grid-cols-2">
            <ImageUpload
              label={`Image ${index + 1}`}
              folder={folder}
              value={shot.src}
              onUploaded={(asset) => onShot(index, { ...shot, src: asset.url, publicId: asset.publicId })}
              onUrl={(url) => onShot(index, { ...shot, src: url, publicId: undefined })}
            />
            <div className="grid gap-3">
              <TextInput
                placeholder="Alt"
                value={shot.alt}
                onChange={(e) => onShot(index, { ...shot, alt: e.target.value })}
              />
              <TextInput
                placeholder="Caption"
                value={shot.caption ?? ""}
                onChange={(e) => onShot(index, { ...shot, caption: e.target.value })}
              />
              <button
                type="button"
                className="text-left text-sm text-muted hover:text-fg"
                onClick={() => onChange(shots.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-3 text-sm text-accent"
        onClick={() => onChange([...shots, { src: "", alt: "" }])}
      >
        Add screenshot
      </button>
    </div>
  );
}
