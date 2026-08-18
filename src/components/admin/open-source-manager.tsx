"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OpenSourceProject } from "@/types/content";
import { deleteOpenSource, importOpenSourceOwner, importOpenSourceRepo, saveOpenSource, syncOpenSource } from "@/app/admin/actions";
import { Field, LinesEditor, TextArea, TextInput } from "@/components/admin/fields";

export function OpenSourceManager({ items }: { items: OpenSourceProject[] }) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string | null>(items[0]?.slug ?? null);
  const [repoUrl, setRepoUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [busy, setBusy] = useState<"repo" | "owner" | "save" | "sync" | "delete" | null>(null);
  const [message, setMessage] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Record<string, unknown>>>(
    Object.fromEntries(items.map((item) => [item.slug, normalize(item)])),
  );

  const active = activeSlug ? drafts[activeSlug] : null;

  const orderedSlugs = useMemo(() => {
    const existing = items.map((item) => item.slug);
    const extras = Object.keys(drafts).filter((slug) => !existing.includes(slug));
    return [...existing, ...extras];
  }, [drafts, items]);

  async function refresh() {
    router.refresh();
  }

  async function onImportRepo() {
    setBusy("repo");
    setMessage("");
    const result = await importOpenSourceRepo(repoUrl);
    setBusy(null);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setRepoUrl("");
    setActiveSlug(result.slug);
    setMessage("Imported repo from GitHub.");
    await refresh();
  }

  async function onImportOwner() {
    setBusy("owner");
    setMessage("");
    const result = await importOpenSourceOwner(owner);
    setBusy(null);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setOwner("");
    setMessage(`Imported ${result.count} repos from GitHub.`);
    await refresh();
  }

  async function onSave() {
    if (!activeSlug || !active) return;
    setBusy("save");
    setMessage("");
    await saveOpenSource(denormalize(active));
    setBusy(null);
    setMessage("Saved open source entry.");
    await refresh();
  }

  async function onSync() {
    if (!activeSlug) return;
    setBusy("sync");
    setMessage("");
    const result = await syncOpenSource(activeSlug);
    setBusy(null);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage("Synced repo from GitHub.");
    await refresh();
  }

  async function onDelete() {
    if (!activeSlug) return;
    setBusy("delete");
    setMessage("");
    await deleteOpenSource(activeSlug);
    const next = orderedSlugs.filter((slug) => slug !== activeSlug)[0] ?? null;
    setDrafts((current) => {
      const copy = { ...current };
      delete copy[activeSlug];
      return copy;
    });
    setActiveSlug(next);
    setBusy(null);
    setMessage("Deleted open source entry.");
    await refresh();
  }

  function patch(key: string, value: string) {
    if (!activeSlug) return;
    setDrafts((current) => {
      const entry = current[activeSlug] ?? normalize(blank());
      const next = {
        ...entry,
        [key]: value,
        topics: String(key === "topicsText" ? value : entry.topicsText ?? "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      return { ...current, [activeSlug]: next };
    });
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 rounded-3xl border border-line bg-bg-elevated/40 p-5 md:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Import single repo</p>
          <Field label="GitHub repo URL" className="mt-4">
            <TextInput
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/owner/repo"
            />
          </Field>
          <button
            type="button"
            onClick={() => void onImportRepo()}
            disabled={busy !== null || !repoUrl.trim()}
            className="btn-solid mt-4 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium disabled:opacity-50"
          >
            {busy === "repo" ? "Importing…" : "Import repo"}
          </button>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Bulk import owner</p>
          <Field label="GitHub username or org" className="mt-4">
            <TextInput value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="ammar-tariq" />
          </Field>
          <button
            type="button"
            onClick={() => void onImportOwner()}
            disabled={busy !== null || !owner.trim()}
            className="btn-solid mt-4 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium disabled:opacity-50"
          >
            {busy === "owner" ? "Importing…" : "Import repos"}
          </button>
        </div>
        {message ? <p className="text-sm text-muted md:col-span-2">{message}</p> : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <ul className="divide-y divide-line border-y border-line">
          {orderedSlugs.map((slug) => {
            const item = drafts[slug];
            if (!item) return null;
            const title = String(item.title ?? slug);
            return (
              <li key={slug} className="flex items-center justify-between gap-3 py-3">
                <button
                  type="button"
                  className={`text-left ${activeSlug === slug ? "text-accent" : "text-fg"}`}
                  onClick={() => setActiveSlug(slug)}
                >
                  <div>{title}</div>
                  <div className="text-sm text-muted">{String(item.language ?? "") || "Unknown language"}</div>
                </button>
              </li>
            );
          })}
          {!orderedSlugs.length ? <li className="py-3 text-sm text-muted">No open source entries yet.</li> : null}
        </ul>

        {active ? (
          <div className="grid gap-4">
            <Field label="Slug">
              <TextInput value={String(active.slug ?? "")} onChange={(e) => patch("slug", e.target.value)} />
            </Field>
            <Field label="Title">
              <TextInput value={String(active.title ?? "")} onChange={(e) => patch("title", e.target.value)} />
            </Field>
            <Field label="Description">
              <TextArea value={String(active.description ?? "")} onChange={(e) => patch("description", e.target.value)} />
            </Field>
            <Field label="Repo URL">
              <TextInput value={String(active.repoUrl ?? "")} onChange={(e) => patch("repoUrl", e.target.value)} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Demo URL">
                <TextInput value={String(active.demoUrl ?? "")} onChange={(e) => patch("demoUrl", e.target.value)} />
              </Field>
              <Field label="Demo label">
                <TextInput value={String(active.demoLabel ?? "")} onChange={(e) => patch("demoLabel", e.target.value)} />
              </Field>
            </div>
            <Field label="Language">
              <TextInput value={String(active.language ?? "")} onChange={(e) => patch("language", e.target.value)} />
            </Field>
            <LinesEditor
              label="Topics"
              value={String(active.topicsText ?? "").split("\n")}
              onChange={(value) => patch("topicsText", value.join("\n"))}
            />
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => void onSave()} disabled={busy !== null} className="btn-solid h-12 rounded-full px-6 text-sm disabled:opacity-50">
                {busy === "save" ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => void onSync()} disabled={busy !== null} className="h-12 rounded-full border border-line px-6 text-sm text-fg disabled:opacity-50">
                {busy === "sync" ? "Syncing…" : "Sync from GitHub"}
              </button>
              <button type="button" onClick={() => void onDelete()} disabled={busy !== null} className="h-12 rounded-full border border-line px-6 text-sm text-muted disabled:opacity-50">
                {busy === "delete" ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Import a repo or choose an item to edit.</p>
        )}
      </div>
    </div>
  );
}

function blank(): OpenSourceProject {
  return {
    slug: "",
    title: "",
    description: "",
    repoUrl: "",
    demoUrl: "",
    demoLabel: "",
    language: "",
    topics: [],
  };
}

function normalize(item: OpenSourceProject) {
  return { ...item, topicsText: (item.topics ?? []).join("\n") };
}

function denormalize(item: Record<string, unknown>) {
  return {
    ...item,
    topics: String(item.topicsText ?? "")
      .split("\n")
      .map((topic) => topic.trim())
      .filter(Boolean),
  };
}
