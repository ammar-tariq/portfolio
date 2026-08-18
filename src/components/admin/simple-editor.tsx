"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, LinesEditor, TextArea, TextInput } from "@/components/admin/fields";
import {
  deleteExperience,
  deleteIndustry,
  deleteOpenSource,
  deletePrinciple,
  deleteSkill,
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
}: {
  kind: Kind;
  items: Record<string, unknown>[];
}) {
  const router = useRouter();
  const [active, setActive] = useState<Record<string, unknown> | null>(null);

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
    if (kind === "experience") await deleteExperience(id);
    if (kind === "skill") await deleteSkill(id);
    if (kind === "principle") await deletePrinciple(id);
    if (kind === "industry") await deleteIndustry(id);
    if (kind === "opensource") await deleteOpenSource(id);
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => {
          const key = String(item.id ?? item.slug ?? item.label);
          return (
            <li key={key} className="flex items-center justify-between gap-3 py-3">
              <button type="button" className="text-left text-fg" onClick={() => setActive(normalize(kind, item))}>
                {String(item.title ?? item.label ?? item.role ?? item.slug)}
              </button>
              <button type="button" className="text-sm text-muted" onClick={() => remove(key)}>
                Delete
              </button>
            </li>
          );
        })}
        <li className="py-3">
          <button type="button" className="text-sm text-accent" onClick={() => setActive(blank(kind))}>
            Add new
          </button>
        </li>
      </ul>
      {active ? (
        <div className="grid gap-4">
          {kind === "experience" ? <ExperienceFields value={active} onChange={setActive} /> : null}
          {kind === "skill" ? <SkillFields value={active} onChange={setActive} /> : null}
          {kind === "principle" ? <PrincipleFields value={active} onChange={setActive} /> : null}
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
          <button type="button" onClick={save} className="btn-solid h-12 rounded-full px-6 text-sm">
            Save
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted">Select an item or add a new one.</p>
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

function ExperienceFields({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const set = (key: string, v: string) =>
    onChange({
      ...value,
      [key]: v,
      technologies: String(key === "technologiesText" ? v : value.technologiesText ?? "").split("\n").filter(Boolean),
      responsibilities: String(key === "responsibilitiesText" ? v : value.responsibilitiesText ?? "").split("\n").filter(Boolean),
      projects: String(key === "projectsText" ? v : value.projectsText ?? "").split("\n").filter(Boolean),
    });
  return (
    <>
      <Field label="ID"><TextInput value={String(value.id ?? "")} onChange={(e) => set("id", e.target.value)} /></Field>
      <Field label="Role"><TextInput value={String(value.role ?? "")} onChange={(e) => set("role", e.target.value)} /></Field>
      <Field label="Company"><TextInput value={String(value.company ?? "")} onChange={(e) => set("company", e.target.value)} /></Field>
      <Field label="Period"><TextInput value={String(value.period ?? "")} onChange={(e) => set("period", e.target.value)} /></Field>
      <Field label="Year"><TextInput value={String(value.year ?? "")} onChange={(e) => set("year", e.target.value)} /></Field>
      <Field label="Location"><TextInput value={String(value.location ?? "")} onChange={(e) => set("location", e.target.value)} /></Field>
      <Field label="Summary"><TextArea value={String(value.summary ?? "")} onChange={(e) => set("summary", e.target.value)} /></Field>
      <LinesEditor label="Technologies" value={String(value.technologiesText ?? "").split("\n")} onChange={(v) => set("technologiesText", v.join("\n"))} />
      <LinesEditor label="Responsibilities" value={String(value.responsibilitiesText ?? "").split("\n")} onChange={(v) => set("responsibilitiesText", v.join("\n"))} />
      <LinesEditor label="Project slugs" value={String(value.projectsText ?? "").split("\n")} onChange={(v) => set("projectsText", v.join("\n"))} />
    </>
  );
}

function SkillFields({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  return (
    <>
      <Field label="ID"><TextInput value={String(value.id ?? "")} onChange={(e) => onChange({ ...value, id: e.target.value })} /></Field>
      <Field label="Label"><TextInput value={String(value.label ?? "")} onChange={(e) => onChange({ ...value, label: e.target.value })} /></Field>
      <Field label="Summary"><TextArea value={String(value.summary ?? "")} onChange={(e) => onChange({ ...value, summary: e.target.value })} /></Field>
      <LinesEditor label="Items" value={String(value.itemsText ?? "").split("\n")} onChange={(v) => onChange({ ...value, itemsText: v.join("\n") })} />
    </>
  );
}

function PrincipleFields({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  return (
    <>
      <Field label="ID"><TextInput value={String(value.id ?? "")} onChange={(e) => onChange({ ...value, id: e.target.value })} /></Field>
      <Field label="Title"><TextInput value={String(value.title ?? "")} onChange={(e) => onChange({ ...value, title: e.target.value })} /></Field>
      <Field label="Statement"><TextInput value={String(value.statement ?? "")} onChange={(e) => onChange({ ...value, statement: e.target.value })} /></Field>
      <Field label="Body"><TextArea value={String(value.body ?? "")} onChange={(e) => onChange({ ...value, body: e.target.value })} /></Field>
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
