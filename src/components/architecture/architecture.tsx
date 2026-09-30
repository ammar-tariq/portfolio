"use client";

import { useState } from "react";
import { Cloud, Cpu, Database, Layers, Monitor, Server, type LucideIcon } from "lucide-react";
import { Container, Section, SectionIntro } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { dossierEntry } from "@/lib/dossier";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/reveal";

type Node = { id: string; label: string; detail: string };

const LAYER_ICONS: LucideIcon[] = [Monitor, Server, Database, Cloud, Cpu, Layers];

export function Architecture() {
  const { architecture } = useContent();
  const layers = architecture.systemArchitecture;
  const entry = dossierEntry("architecture");
  const nodes: Node[] = layers.flatMap((layer) =>
    layer.children?.length
      ? layer.children.map((child) => ({
          id: child.id,
          label: child.label,
          detail: child.detail ?? layer.detail ?? "",
        }))
      : [{ id: layer.id, label: layer.label, detail: layer.detail ?? "" }],
  );
  const [active, setActive] = useState(nodes[2]?.id ?? nodes[0]?.id ?? "");
  const [engaged, setEngaged] = useState(false);
  const current = nodes.find((node) => node.id === active) ?? nodes[0];
  if (!current || layers.length === 0) return null;

  return (
    <Section id="architecture">
      <Container>
        <SectionIntro
          marker={entry?.marker ?? "06"}
          label={entry?.label ?? "Architecture"}
          title="The whole path — not only the screens."
          kicker="Clients, API, data, and infrastructure as one map you can inspect."
        />
        <Reveal>
        <div className="axis-grid">
          <div className="axis-side max-[719px]:hidden" />
          <div className="axis-main">
            <div
              className={cn("system-flow flex flex-col gap-8 min-[1100px]:grid min-[1100px]:gap-0", engaged && "is-engaged")}
              style={{ ["--layers" as string]: String(layers.length) }}
              onMouseLeave={() => setEngaged(false)}
            >
              {layers.map((layer, layerIndex) => {
                const layerNodes: Node[] = layer.children?.length
                  ? layer.children.map((child) => ({
                      id: child.id,
                      label: child.label,
                      detail: child.detail ?? layer.detail ?? "",
                    }))
                  : [{ id: layer.id, label: layer.label, detail: layer.detail ?? "" }];
                const layerOn = layerNodes.some((node) => node.id === active);
                const LayerIcon = LAYER_ICONS[layerIndex % LAYER_ICONS.length];
                return (
                  <div
                    key={layer.id}
                    className={cn(
                      "min-[1100px]:border-t min-[1100px]:px-4 min-[1100px]:pt-4",
                      layerIndex === 0 && "min-[1100px]:pl-0",
                    )}
                  >
                    <p className={cn("layer-label meta-label mb-3 inline-flex items-center gap-1.5", layerOn && engaged && "is-on")}>
                      <LayerIcon className="h-3.5 w-3.5 text-accent" aria-hidden />
                      {layer.label}
                    </p>
                    <div className="border-l border-line pl-4 min-[1100px]:border-l-0 min-[1100px]:pl-0">
                      {layerNodes.map((node) => {
                        const on = active === node.id;
                        return (
                          <button
                            key={node.id}
                            type="button"
                            className={cn(
                              "arch-node block w-full border-t border-line py-2.5 text-left text-sm tracking-tight transition-opacity duration-[var(--dur)]",
                              on ? "is-on border-accent text-fg" : "text-muted hover:text-fg",
                            )}
                            aria-pressed={on}
                            onMouseEnter={() => {
                              setActive(node.id);
                              setEngaged(true);
                            }}
                            onFocus={() => {
                              setActive(node.id);
                              setEngaged(true);
                            }}
                            onClick={() => setActive(node.id)}
                          >
                            {node.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-8 max-w-[var(--read)] min-h-[3.25rem] text-sm leading-relaxed text-muted md:text-base" aria-live="polite">
              {current.detail}
            </p>
            <p className="meta-label mt-3">{layers.length} layers</p>
          </div>
        </div>
        </Reveal>
      </Container>
    </Section>
  );
}
