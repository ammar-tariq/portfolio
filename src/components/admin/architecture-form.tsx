"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ArchitectureContent,
  ArchitectureLayer,
  IdentityBranch,
  PipelineStep,
} from "@/types/content";
import { saveArchitecture, rewriteArchitectureSection } from "@/app/admin/actions";
import type { ArchitectureSection } from "@/lib/draft-architecture";
import { slugify } from "@/lib/project-helpers";
import { Field, GeminiAction, LinesEditor, TextArea, TextInput } from "@/components/admin/fields";
import { AdminButton, AdminPanel } from "@/components/admin/admin-ui";

export function ArchitectureForm({
  initial,
  canDraft = false,
  engineer,
}: {
  initial: ArchitectureContent;
  canDraft?: boolean;
  engineer: string;
}) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<ArchitectureSection | null>(null);

  function update<K extends keyof ArchitectureContent>(key: K, value: ArchitectureContent[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  async function generate(section: ArchitectureSection) {
    setBusy(section);
    setError("");
    const result = await rewriteArchitectureSection(section, data, engineer);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    update(section, result.value as ArchitectureContent[typeof section]);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await saveArchitecture(sanitizeArchitecture(data));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save architecture.");
    } finally {
      setSaving(false);
    }
  }

  const gemini = (section: ArchitectureSection, empty: boolean) => (
    <GeminiAction
      busy={busy === section}
      empty={empty}
      disabled={!canDraft || busy !== null}
      onClick={() => void generate(section)}
    />
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      {!canDraft ? (
        <p className="text-sm text-muted">Add GEMINI_API_KEY to enable Generate on each diagram.</p>
      ) : null}

      <Section
        title="Identity graph"
        hint="Root at the top, four practice branches, architecture as the foundation."
        action={gemini("identityGraph", data.identityGraph.branches.length === 0)}
      >
        <p className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">Root</p>
        <NodeFields
          id={data.identityGraph.root.id}
          label={data.identityGraph.root.label}
          detail={data.identityGraph.root.detail ?? ""}
          onChange={(next) =>
            update("identityGraph", { ...data.identityGraph, root: { ...data.identityGraph.root, ...next } })
          }
        />
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">Branches</p>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() =>
                update("identityGraph", {
                  ...data.identityGraph,
                  branches: [...data.identityGraph.branches, blankBranch(data.identityGraph.branches.length)],
                })
              }
            >
              Add branch
            </AdminButton>
          </div>
          <ol className="space-y-3">
            {data.identityGraph.branches.map((branch, index) => (
              <li key={`${branch.id}-${index}`} className="rounded-lg border border-line bg-bg/40 p-4">
                <TreeLabel index={index} label={branch.label || "Branch"} onRemove={() =>
                  update("identityGraph", {
                    ...data.identityGraph,
                    branches: data.identityGraph.branches.filter((_, i) => i !== index),
                  })
                } />
                <NodeFields
                  id={branch.id}
                  label={branch.label}
                  detail={branch.detail ?? ""}
                  onChange={(next) =>
                    update("identityGraph", {
                      ...data.identityGraph,
                      branches: setAt(data.identityGraph.branches, index, { ...branch, ...next }),
                    })
                  }
                />
                <LinesEditor
                  label="Children"
                  value={branch.children}
                  placeholder="React Native&#10;TypeScript"
                  onChange={(children) =>
                    update("identityGraph", {
                      ...data.identityGraph,
                      branches: setAt(data.identityGraph.branches, index, { ...branch, children }),
                    })
                  }
                />
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-5">
          <p className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">Foundation</p>
          <NodeFields
            id={data.identityGraph.foundation.id}
            label={data.identityGraph.foundation.label}
            detail={data.identityGraph.foundation.detail ?? ""}
            onChange={(next) =>
              update("identityGraph", {
                ...data.identityGraph,
                foundation: { ...data.identityGraph.foundation, ...next },
              })
            }
          />
        </div>
      </Section>

      <Section
        title="System map"
        hint="Layers from clients down to infra. Nested items are the boxes on the homepage diagram."
        action={gemini("systemArchitecture", data.systemArchitecture.length === 0)}
      >
        <ol className="space-y-3">
          {data.systemArchitecture.map((layer, index) => (
            <li key={`${layer.id}-${index}`} className="rounded-lg border border-line bg-bg/40 p-4">
              <TreeLabel
                index={index}
                label={layer.label || "Layer"}
                onRemove={() => update("systemArchitecture", data.systemArchitecture.filter((_, i) => i !== index))}
              />
              <NodeFields
                id={layer.id}
                label={layer.label}
                detail={layer.detail ?? ""}
                onChange={(next) =>
                  update("systemArchitecture", setAt(data.systemArchitecture, index, { ...layer, ...next }))
                }
              />
              <div className="mt-4 ml-3 space-y-3 border-l border-line pl-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">Children</p>
                  <AdminButton
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      update(
                        "systemArchitecture",
                        setAt(data.systemArchitecture, index, {
                          ...layer,
                          children: [...(layer.children ?? []), blankNode(`item-${(layer.children?.length ?? 0) + 1}`)],
                        }),
                      )
                    }
                  >
                    Add child
                  </AdminButton>
                </div>
                {(layer.children ?? []).map((child, childIndex) => (
                  <div key={`${child.id}-${childIndex}`} className="rounded-md border border-line/80 p-3">
                    <TreeLabel
                      index={childIndex}
                      label={child.label || "Node"}
                      onRemove={() =>
                        update(
                          "systemArchitecture",
                          setAt(data.systemArchitecture, index, {
                            ...layer,
                            children: (layer.children ?? []).filter((_, i) => i !== childIndex),
                          }),
                        )
                      }
                    />
                    <NodeFields
                      id={child.id}
                      label={child.label}
                      detail={child.detail ?? ""}
                      onChange={(next) =>
                        update(
                          "systemArchitecture",
                          setAt(data.systemArchitecture, index, {
                            ...layer,
                            children: setAt(layer.children ?? [], childIndex, { ...child, ...next }),
                          }),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
        <AdminButton
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={() =>
            update("systemArchitecture", [
              ...data.systemArchitecture,
              blankLayer(data.systemArchitecture.length),
            ])
          }
        >
          Add layer
        </AdminButton>
      </Section>

      <Section
        title="AI pipeline"
        hint="Ordered steps across the homepage AI diagram."
        action={gemini("aiPipeline", data.aiPipeline.length === 0)}
      >
        <ol className="space-y-3">
          {data.aiPipeline.map((step, index) => (
            <li key={`${step.id}-${index}`} className="rounded-lg border border-line bg-bg/40 p-4">
              <TreeLabel
                index={index}
                label={step.label || "Step"}
                onRemove={() => update("aiPipeline", data.aiPipeline.filter((_, i) => i !== index))}
              />
              <NodeFields
                id={step.id}
                label={step.label}
                detail={step.detail ?? ""}
                onChange={(next) => update("aiPipeline", setAt(data.aiPipeline, index, { ...step, ...next }))}
              />
            </li>
          ))}
        </ol>
        <AdminButton
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={() => update("aiPipeline", [...data.aiPipeline, blankNode(`step-${data.aiPipeline.length + 1}`)])}
        >
          Add step
        </AdminButton>
      </Section>

      <Section
        title="AI concepts"
        hint="The clickable concept cards under the pipeline."
        action={gemini("aiConcepts", data.aiConcepts.length === 0)}
      >
        <ol className="space-y-3">
          {data.aiConcepts.map((concept, index) => (
            <li key={`${concept.id}-${index}`} className="rounded-lg border border-line bg-bg/40 p-4">
              <TreeLabel
                index={index}
                label={concept.label || "Concept"}
                onRemove={() => update("aiConcepts", data.aiConcepts.filter((_, i) => i !== index))}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="ID">
                  <TextInput
                    value={concept.id}
                    onChange={(event) =>
                      update("aiConcepts", setAt(data.aiConcepts, index, { ...concept, id: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Label">
                  <TextInput
                    value={concept.label}
                    onChange={(event) =>
                      update("aiConcepts", setAt(data.aiConcepts, index, { ...concept, label: event.target.value }))
                    }
                  />
                </Field>
              </div>
              <Field label="Body" className="mt-3">
                <TextArea
                  value={concept.body}
                  onChange={(event) =>
                    update("aiConcepts", setAt(data.aiConcepts, index, { ...concept, body: event.target.value }))
                  }
                />
              </Field>
            </li>
          ))}
        </ol>
        <AdminButton
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={() =>
            update("aiConcepts", [
              ...data.aiConcepts,
              { id: `concept-${data.aiConcepts.length + 1}`, label: "", body: "" },
            ])
          }
        >
          Add concept
        </AdminButton>
      </Section>

      {error ? <p className="text-sm text-muted">{error}</p> : null}
      <AdminButton type="submit" variant="primary" disabled={saving}>
        {saving ? "Saving…" : "Save architecture"}
      </AdminButton>
    </form>
  );
}

function Section({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AdminPanel className="p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">{title}</h2>
          <p className="mt-1 text-sm text-muted">{hint}</p>
        </div>
        {action}
      </div>
      {children}
    </AdminPanel>
  );
}

function TreeLabel({
  index,
  label,
  onRemove,
}: {
  index: number;
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">
        {String(index + 1).padStart(2, "0")} · {label}
      </p>
      <AdminButton type="button" variant="ghost" onClick={onRemove}>
        Remove
      </AdminButton>
    </div>
  );
}

function NodeFields({
  id,
  label,
  detail,
  onChange,
}: {
  id: string;
  label: string;
  detail: string;
  onChange: (next: { id: string; label: string; detail?: string }) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="ID">
        <TextInput
          value={id}
          placeholder={slugify(label) || "id"}
          onChange={(event) => onChange({ id: event.target.value, label, detail })}
        />
      </Field>
      <Field label="Label">
        <TextInput value={label} onChange={(event) => onChange({ id, label: event.target.value, detail })} />
      </Field>
      <Field label="Detail" className="md:col-span-2">
        <TextArea value={detail} onChange={(event) => onChange({ id, label, detail: event.target.value })} />
      </Field>
    </div>
  );
}

function setAt<T>(list: T[], index: number, value: T) {
  return list.map((item, i) => (i === index ? value : item));
}

function blankNode(id: string): PipelineStep {
  return { id, label: "", detail: "" };
}

function blankBranch(index: number): IdentityBranch {
  return { id: `branch-${index + 1}`, label: "", detail: "", children: [] };
}

function blankLayer(index: number): ArchitectureLayer {
  return { id: `layer-${index + 1}`, label: "", detail: "", children: [] };
}

function namedId(label: string, fallback: string) {
  return slugify(label) || fallback;
}

function sanitizeArchitecture(data: ArchitectureContent): ArchitectureContent {
  return {
    identityGraph: {
      root: {
        ...data.identityGraph.root,
        id: namedId(data.identityGraph.root.label, data.identityGraph.root.id || "root"),
        label: data.identityGraph.root.label.trim(),
        detail: data.identityGraph.root.detail?.trim() || undefined,
      },
      branches: data.identityGraph.branches
        .filter((branch) => branch.label.trim())
        .map((branch, index) => ({
          id: namedId(branch.label, branch.id || `branch-${index + 1}`),
          label: branch.label.trim(),
          detail: branch.detail?.trim() || undefined,
          children: branch.children.map((child) => child.trim()).filter(Boolean),
        })),
      foundation: {
        ...data.identityGraph.foundation,
        id: namedId(data.identityGraph.foundation.label, data.identityGraph.foundation.id || "foundation"),
        label: data.identityGraph.foundation.label.trim(),
        detail: data.identityGraph.foundation.detail?.trim() || undefined,
      },
    },
    systemArchitecture: data.systemArchitecture
      .filter((layer) => layer.label.trim())
      .map((layer, index) => ({
        id: namedId(layer.label, layer.id || `layer-${index + 1}`),
        label: layer.label.trim(),
        detail: layer.detail?.trim() || undefined,
        children: (layer.children ?? [])
          .filter((child) => child.label.trim())
          .map((child, childIndex) => ({
            id: namedId(child.label, child.id || `item-${childIndex + 1}`),
            label: child.label.trim(),
            detail: child.detail?.trim() || undefined,
          })),
      })),
    aiPipeline: data.aiPipeline
      .filter((step) => step.label.trim())
      .map((step, index) => ({
        id: namedId(step.label, step.id || `step-${index + 1}`),
        label: step.label.trim(),
        detail: step.detail?.trim() || undefined,
      })),
    aiConcepts: data.aiConcepts
      .filter((concept) => concept.label.trim())
      .map((concept, index) => ({
        id: namedId(concept.label, concept.id || `concept-${index + 1}`),
        label: concept.label.trim(),
        body: concept.body.trim(),
      })),
  };
}
