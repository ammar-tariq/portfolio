import { generateGeminiJson } from "@/lib/draft-project";
import type {
  AiConcept,
  ArchitectureContent,
  ArchitectureLayer,
  IdentityBranch,
  IdentityGraph,
  PipelineStep,
} from "@/types/content";

export type ArchitectureSection = keyof ArchitectureContent;

function text(value: unknown, max = 240) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function idOf(value: unknown, fallback: string) {
  const raw = text(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return raw || fallback;
}

function node(value: unknown, fallback: string): { id: string; label: string; detail?: string } {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const label = text(record.label, 80) || fallback;
  const detail = text(record.detail, 280);
  return {
    id: idOf(record.id, fallback),
    label,
    ...(detail ? { detail } : {}),
  };
}

function identityGraphFrom(raw: unknown, fallback: IdentityGraph): IdentityGraph {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const branchesRaw = Array.isArray(record.branches) ? record.branches : fallback.branches;
  const branches: IdentityBranch[] = branchesRaw.slice(0, 8).map((item, index) => {
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const base = node(entry, `branch-${index + 1}`);
    const children = Array.isArray(entry.children)
      ? entry.children.map((child) => text(child, 40)).filter(Boolean).slice(0, 8)
      : [];
    return { ...base, children };
  });
  return {
    root: node(record.root, fallback.root.id),
    branches: branches.length ? branches : fallback.branches,
    foundation: node(record.foundation, fallback.foundation.id),
  };
}

function layersFrom(raw: unknown, fallback: ArchitectureLayer[]): ArchitectureLayer[] {
  const list = Array.isArray(raw) ? raw : fallback;
  const layers = list.slice(0, 8).map((item, index) => {
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const base = node(entry, `layer-${index + 1}`);
    const children = Array.isArray(entry.children)
      ? entry.children.slice(0, 8).map((child, childIndex) => node(child, `${base.id}-${childIndex + 1}`))
      : undefined;
    return { ...base, ...(children?.length ? { children } : {}) };
  });
  return layers.length ? layers : fallback;
}

function stepsFrom(raw: unknown, fallback: PipelineStep[]): PipelineStep[] {
  const list = Array.isArray(raw) ? raw : fallback;
  const steps = list.slice(0, 10).map((item, index) => node(item, `step-${index + 1}`));
  return steps.length ? steps : fallback;
}

function conceptsFrom(raw: unknown, fallback: AiConcept[]): AiConcept[] {
  const list = Array.isArray(raw) ? raw : fallback;
  const concepts = list.slice(0, 12).map((item, index) => {
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const base = node(entry, `concept-${index + 1}`);
    return { ...base, body: text(entry.body ?? entry.detail, 400) };
  });
  return concepts.length ? concepts : fallback;
}

const instructions: Record<ArchitectureSection, string> = {
  identityGraph:
    "Return { root, branches, foundation }. root and foundation are { id, label, detail }. branches is 3–5 items with { id, label, detail, children: string[] } where children are 2–5 concrete technologies.",
  systemArchitecture:
    "Return an array of 3–5 layers. Each layer is { id, label, detail, children?: { id, label, detail }[] }. Typical stack: clients → API → data → infra. Children are the boxes in that layer.",
  aiPipeline:
    "Return an array of 5–7 pipeline steps in order. Each is { id, label, detail }. Typical: user → application → orchestration → model → tools → result.",
  aiConcepts:
    "Return 6–8 concepts. Each is { id, label, body }. Short engineering definitions, not marketing.",
};

export async function rewriteArchitectureSectionWithGemini(input: {
  section: ArchitectureSection;
  architecture: ArchitectureContent;
  engineer: string;
}): Promise<ArchitectureContent[ArchitectureSection]> {
  const prompt = `You edit one section of a software engineer's public architecture diagrams.

Voice: precise, systems-minded, no marketing fluff, no invented employers or metrics.
Engineer: ${input.engineer || "the engineer"}

Section: ${input.section}
${instructions[input.section]}

Keep facts that are already present. Improve labels and details. Use stable kebab-case ids.
Return JSON: { "value": <section payload> }

Current value:
${JSON.stringify(input.architecture[input.section], null, 2)}`;

  const raw = await generateGeminiJson(prompt);
  const value = raw.value ?? raw[input.section] ?? raw;
  if (input.section === "identityGraph") return identityGraphFrom(value, input.architecture.identityGraph);
  if (input.section === "systemArchitecture") return layersFrom(value, input.architecture.systemArchitecture);
  if (input.section === "aiPipeline") return stepsFrom(value, input.architecture.aiPipeline);
  return conceptsFrom(value, input.architecture.aiConcepts);
}
