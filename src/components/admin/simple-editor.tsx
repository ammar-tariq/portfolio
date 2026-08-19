"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, GeminiAction, LinesEditor, TextArea, TextInput } from "@/components/admin/fields";
import { AdminButton, AdminPanel } from "@/components/admin/admin-ui";
import { cn } from "@/lib/cn";
import {
  deleteExperience,
  deleteIndustry,
  deleteOpenSource,
  deletePrinciple,
  deleteSkill,
  rewriteSiteCopy,
  saveExperience,
  saveIndustry,
  saveOpenSource,
  savePrinciple,
  saveSkill,
} from "@/app/admin/actions";
import { slugify } from "@/lib/project-helpers";

type Kind = "experience" | "skill" | "principle" | "industry" | "opensource";

export function SimpleEditor({
  kind,
  items,
  canDraft = false,
}: {
  kind: Kind;
  items: Record<string, unknown>[];
  canDraft?: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function save() {
    if (!active) return;
    if (kind === "experience") await saveExperience(active);
    if (kind === "skill") {
      const itemsField = String(active.itemsText ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((name) => ({ name }));
      await saveSkill({ ...active, items: itemsField, id: String(active.id || slugify(String(active.label ?? ""))) });
    }
    if (kind === "principle") await savePrinciple(active);
    if (kind === "industry") await saveIndustry({ id: String(active.id || slugify(String(active.label ?? ""))), label: String(active.label ?? "") });
    if (kind === "opensource") await saveOpenSource(active);
    setActive(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    if (kind === "experience") await deleteExperience(id);
    if (kind === "skill") await deleteSkill(id);
    if (kind === "principle") await deletePrinciple(id);
    if (kind === "industry") await deleteIndustry(id);
    if (kind === "opensource") await deleteOpenSource(id);
    if (String(active?.id ?? active?.slug ?? "") === id) setActive(null);
    router.refresh();
  }

  const activeKey = active ? String(active.id ?? active.slug ?? active.label ?? "") : "";

  async function rewrite(key: string, current: unknown, apply: (value: string | string[]) => void) {
    if (!active) return;
    setBusy(key);
    setError("");
    const result = await rewriteSiteCopy(key, current, active);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    apply(result.value);
  }

  function gemini(key: string, empty: boolean, current: unknown, apply: (value: string | string[]) => void) {
    return (
      <GeminiAction
        busy={busy === key}
        empty={empty}
        disabled={!canDraft || busy !== null}
        onClick={() => void rewrite(key, current, apply)}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <AdminPanel>
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="text-sm font-medium">Items</p>
          <AdminButton type="button" variant="primary" onClick={() => setActive(blank(kind))}>
            Add
          </AdminButton>
        </div>
        <ul className="divide-y divide-line">
          {items.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted">Nothing here yet. Add the first item.</li>
          ) : (
            items.map((item) => {
              const key = String(item.id ?? item.slug ?? item.label);
              const selected = activeKey === key;
              return (
                <li key={key} className={cn("flex items-center gap-2 px-2 py-1.5", selected && "bg-fg/6")}>
                  <button
                    type="button"
                    className="min-w-0 flex-1 rounded-md px-2 py-2 text-left text-sm hover:text-fg"
                    onClick={() => setActive(normalize(kind, item))}
                  >
                    {String(item.title ?? item.label ?? item.role ?? item.slug)}
                  </button>
                  <AdminButton type="button" variant="ghost" onClick={() => void remove(key)}>
                    Delete
                  </AdminButton>
                </li>
              );
            })
          )}
        </ul>
      </AdminPanel>
      {active ? (
        <AdminPanel className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm font-medium">
              {String(active.id || active.slug || active.role || active.label) ? "Edit item" : "New item"}
            </p>
            <AdminButton type="button" variant="ghost" onClick={() => setActive(null)}>
              Cancel
            </AdminButton>
          </div>
          <div className="grid gap-4">
            {kind === "experience" ? (
              <ExperienceFields value={active} onChange={setActive} gemini={gemini} />
            ) : null}
            {kind === "skill" ? <SkillFields value={active} onChange={setActive} gemini={gemini} /> : null}
            {kind === "principle" ? <PrincipleFields value={active} onChange={setActive} gemini={gemini} /> : null}
            {kind === "industry" ? (
              <>
                <Field label="ID">
                  <TextInput value={String(active.id ?? "")} onChange={(e) => setActive({ ...active, id: e.target.value })} />
                </Field>
                <Field label="Label">
                  <TextInput value={String(active.label ?? "")} onChange={(e) => setActive({ ...active, label: e.target.value })} />
                </Field>
              </>
            ) : null}
            {kind === "opensource" ? <OpenSourceFields value={active} onChange={setActive} /> : null}
            <div className="flex flex-wrap gap-2 pt-2">
              <AdminButton type="button" variant="primary" onClick={() => void save()}>
                Save
              </AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setActive(null)}>
                Cancel
              </AdminButton>
            </div>
            {error ? <p className="text-sm text-muted">{error}</p> : null}
            {!canDraft && kind !== "industry" && kind !== "opensource" ? (
              <p className="text-sm text-muted">Add GEMINI_API_KEY to enable Generate.</p>
            ) : null}
          </div>
        </AdminPanel>
      ) : (
        <AdminPanel className="flex items-center justify-center px-5 py-16">
          <p className="max-w-xs text-center text-sm text-muted">
            Select an item on the left to edit it, or click Add to create a new one.
          </p>
        </AdminPanel>
      )}
    </div>
  );
}

function normalize(kind: Kind, item: Record<string, unknown>) {
  if (kind === "skill") {
    const items = (item.items as { name: string }[]) ?? [];
    return { ...item, itemsText: items.map((entry) => entry.name).join("\n") };
  }
  if (kind === "experience") {
    return {
      ...item,
      technologiesText: ((item.technologies as string[]) ?? []).join("\n"),
      responsibilitiesText: ((item.responsibilities as string[]) ?? []).join("\n"),
      projectsText: ((item.projects as string[]) ?? []).join("\n"),
    };
  }
  if (kind === "opensource") {
    return { ...item, topicsText: ((item.topics as string[]) ?? []).join("\n") };
  }
  return { ...item };
}

function blank(kind: Kind): Record<string, unknown> {
  if (kind === "experience") return { id: "", role: "", company: "", period: "", year: "", summary: "", technologiesText: "", responsibilitiesText: "", projectsText: "" };
  if (kind === "skill") return { id: "", label: "", summary: "", itemsText: "" };
  if (kind === "principle") return { id: "", title: "", statement: "", body: "" };
  if (kind === "industry") return { id: "", label: "" };
  return { slug: "", title: "", description: "", repoUrl: "", language: "", topicsText: "" };
}

type GeminiFn = (
  key: string,
  empty: boolean,
  current: unknown,
  apply: (value: string | string[]) => void,
) => React.ReactNode;

function ExperienceFields({
  value,
  onChange,
  gemini,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  gemini: GeminiFn;
}) {
  const set = (key: string, v: string) =>
    onChange({
      ...value,
      [key]: v,
      technologies: String(key === "technologiesText" ? v : value.technologiesText ?? "").split("\n").filter((line) => line.trim()),
      responsibilities: String(key === "responsibilitiesText" ? v : value.responsibilitiesText ?? "").split("\n").filter((line) => line.trim()),
      projects: String(key === "projectsText" ? v : value.projectsText ?? "").split("\n").filter((line) => line.trim()),
    });
  const techLines = String(value.technologiesText ?? "").split("\n");
  const responsibilityLines = String(value.responsibilitiesText ?? "").split("\n");
  return (
    <>
      <Field label="ID"><TextInput value={String(value.id ?? "")} onChange={(e) => set("id", e.target.value)} /></Field>
      <Field label="Role"><TextInput value={String(value.role ?? "")} onChange={(e) => set("role", e.target.value)} /></Field>
      <Field label="Company"><TextInput value={String(value.company ?? "")} onChange={(e) => set("company", e.target.value)} /></Field>
      <Field label="Period"><TextInput value={String(value.period ?? "")} onChange={(e) => set("period", e.target.value)} /></Field>
      <Field label="Year"><TextInput value={String(value.year ?? "")} onChange={(e) => set("year", e.target.value)} /></Field>
      <Field label="Location"><TextInput value={String(value.location ?? "")} onChange={(e) => set("location", e.target.value)} /></Field>
      <Field
        label="Summary"
        action={gemini("experience.summary", !String(value.summary ?? "").trim(), value.summary, (next) =>
          onChange({ ...value, summary: String(next) }),
        )}
      >
        <TextArea value={String(value.summary ?? "")} onChange={(e) => set("summary", e.target.value)} />
      </Field>
      <LinesEditor
        label="Technologies"
        value={techLines}
        onChange={(v) => set("technologiesText", v.join("\n"))}
        action={gemini("experience.technologies", techLines.filter((line) => line.trim()).length === 0, techLines, (next) => {
          const lines = Array.isArray(next) ? next : [String(next)];
          onChange({ ...value, technologiesText: lines.join("\n"), technologies: lines.filter((line) => line.trim()) });
        })}
      />
      <LinesEditor
        label="Responsibilities"
        value={responsibilityLines}
        onChange={(v) => set("responsibilitiesText", v.join("\n"))}
        action={gemini("experience.responsibilities", responsibilityLines.filter((line) => line.trim()).length === 0, responsibilityLines, (next) => {
          const lines = Array.isArray(next) ? next : [String(next)];
          onChange({ ...value, responsibilitiesText: lines.join("\n"), responsibilities: lines.filter((line) => line.trim()) });
        })}
      />
      <LinesEditor label="Project slugs" value={String(value.projectsText ?? "").split("\n")} onChange={(v) => set("projectsText", v.join("\n"))} />
    </>
  );
}

function SkillFields({
  value,
  onChange,
  gemini,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  gemini: GeminiFn;
}) {
  const itemLines = String(value.itemsText ?? "").split("\n");
  return (
    <>
      <Field label="ID"><TextInput value={String(value.id ?? "")} onChange={(e) => onChange({ ...value, id: e.target.value })} /></Field>
      <Field label="Label"><TextInput value={String(value.label ?? "")} onChange={(e) => onChange({ ...value, label: e.target.value })} /></Field>
      <Field
        label="Summary"
        action={gemini("skill.summary", !String(value.summary ?? "").trim(), value.summary, (next) =>
          onChange({ ...value, summary: String(next) }),
        )}
      >
        <TextArea value={String(value.summary ?? "")} onChange={(e) => onChange({ ...value, summary: e.target.value })} />
      </Field>
      <LinesEditor
        label="Items"
        value={itemLines}
        onChange={(v) => onChange({ ...value, itemsText: v.join("\n") })}
        action={gemini("skill.items", itemLines.filter((line) => line.trim()).length === 0, itemLines, (next) => {
          const lines = Array.isArray(next) ? next : [String(next)];
          onChange({ ...value, itemsText: lines.join("\n") });
        })}
      />
    </>
  );
}

function PrincipleFields({
  value,
  onChange,
  gemini,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  gemini: GeminiFn;
}) {
  return (
    <>
      <Field label="ID"><TextInput value={String(value.id ?? "")} onChange={(e) => onChange({ ...value, id: e.target.value })} /></Field>
      <Field label="Title"><TextInput value={String(value.title ?? "")} onChange={(e) => onChange({ ...value, title: e.target.value })} /></Field>
      <Field
        label="Statement"
        action={gemini("principle.statement", !String(value.statement ?? "").trim(), value.statement, (next) =>
          onChange({ ...value, statement: String(next) }),
        )}
      >
        <TextInput value={String(value.statement ?? "")} onChange={(e) => onChange({ ...value, statement: e.target.value })} />
      </Field>
      <Field
        label="Body"
        action={gemini("principle.body", !String(value.body ?? "").trim(), value.body, (next) =>
          onChange({ ...value, body: String(next) }),
        )}
      >
        <TextArea value={String(value.body ?? "")} onChange={(e) => onChange({ ...value, body: e.target.value })} />
      </Field>
    </>
  );
}

function OpenSourceFields({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const set = (key: string, v: string) =>
    onChange({ ...value, [key]: v, topics: String(key === "topicsText" ? v : value.topicsText ?? "").split("\n").filter(Boolean) });
  return (
    <>
      <Field label="Slug"><TextInput value={String(value.slug ?? "")} onChange={(e) => set("slug", e.target.value)} /></Field>
      <Field label="Title"><TextInput value={String(value.title ?? "")} onChange={(e) => set("title", e.target.value)} /></Field>
      <Field label="Description"><TextArea value={String(value.description ?? "")} onChange={(e) => set("description", e.target.value)} /></Field>
      <Field label="Repo URL"><TextInput value={String(value.repoUrl ?? "")} onChange={(e) => set("repoUrl", e.target.value)} /></Field>
      <Field label="Demo URL"><TextInput value={String(value.demoUrl ?? "")} onChange={(e) => set("demoUrl", e.target.value)} /></Field>
      <Field label="Language"><TextInput value={String(value.language ?? "")} onChange={(e) => set("language", e.target.value)} /></Field>
      <LinesEditor label="Topics" value={String(value.topicsText ?? "").split("\n")} onChange={(v) => set("topicsText", v.join("\n"))} />
    </>
  );
}
