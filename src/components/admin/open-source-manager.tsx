"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OpenSourceProject } from "@/types/content";
import { deleteOpenSource, importOpenSourceOwner, importOpenSourceRepo, saveOpenSource, syncOpenSource } from "@/app/admin/actions";
import { Field, LinesEditor, TextArea, TextInput } from "@/components/admin/fields";
import { AdminButton, AdminPanel } from "@/components/admin/admin-ui";
import { cn } from "@/lib/cn";

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
    if (!window.confirm("Delete this open source entry?")) return;
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
    <div className="grid gap-6">
      <AdminPanel className="grid gap-6 p-5 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium">Import a repo</p>
          <Field label="GitHub repo URL" className="mt-4">
            <TextInput
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/owner/repo"
            />
          </Field>
          <AdminButton
            type="button"
            variant="primary"
            className="mt-4"
            onClick={() => void onImportRepo()}
            disabled={busy !== null || !repoUrl.trim()}
          >
            {busy === "repo" ? "Importing…" : "Import repo"}
          </AdminButton>
        </div>
        <div>
          <p className="text-sm font-medium">Import all from a user</p>
          <Field label="GitHub username or org" className="mt-4">
            <TextInput value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="ammar-tariq" />
          </Field>
          <AdminButton
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => void onImportOwner()}
            disabled={busy !== null || !owner.trim()}
          >
            {busy === "owner" ? "Importing…" : "Import repos"}
          </AdminButton>
        </div>
        {message ? <p className="text-sm text-muted md:col-span-2">{message}</p> : null}
      </AdminPanel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <AdminPanel>
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-medium">Repositories</p>
          </div>
          <ul className="divide-y divide-line">
            {orderedSlugs.map((slug) => {
              const item = drafts[slug];
              if (!item) return null;
              const title = String(item.title ?? slug);
              return (
                <li key={slug}>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm hover:bg-fg/4",
                      activeSlug === slug && "bg-fg/6",
                    )}
                    onClick={() => setActiveSlug(slug)}
                  >
                    <div className="font-medium">{title}</div>
                    <div className="text-muted">{String(item.language ?? "") || "Unknown language"}</div>
                  </button>
                </li>
              );
            })}
            {!orderedSlugs.length ? <li className="px-4 py-6 text-sm text-muted">No open source entries yet.</li> : null}
          </ul>
        </AdminPanel>

        {active ? (
          <AdminPanel className="grid gap-4 p-5">
            <p className="text-sm font-medium">Edit repository</p>
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
            <div className="flex flex-wrap gap-2">
              <AdminButton type="button" variant="primary" onClick={() => void onSave()} disabled={busy !== null}>
                {busy === "save" ? "Saving…" : "Save"}
              </AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => void onSync()} disabled={busy !== null}>
                {busy === "sync" ? "Syncing…" : "Sync from GitHub"}
              </AdminButton>
              <AdminButton type="button" variant="danger" onClick={() => void onDelete()} disabled={busy !== null}>
                {busy === "delete" ? "Deleting…" : "Delete"}
              </AdminButton>
            </div>
          </AdminPanel>
        ) : (
          <AdminPanel className="flex items-center justify-center px-5 py-16">
            <p className="max-w-xs text-center text-sm text-muted">
              Import a repo above, or choose one on the left to edit.
            </p>
          </AdminPanel>
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
