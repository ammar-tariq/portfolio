"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { DiagramFrame, DiagramNode, Connector } from "@/components/ui/diagram";
import { Reveal } from "@/components/ui/reveal";
import { useContent } from "@/components/providers/content-provider";

export function Architecture() {
  const { architecture } = useContent();
  const systemArchitecture = architecture.systemArchitecture;
  const nodes = systemArchitecture.flatMap((layer) =>
    layer.children?.length
      ? layer.children.map((child) => ({
          id: child.id,
          label: child.label,
          detail: child.detail ?? layer.detail ?? "",
        }))
      : [{ id: layer.id, label: layer.label, detail: layer.detail ?? "" }],
  );
  const [active, setActive] = useState(nodes[2]?.id ?? nodes[0]?.id ?? "");
  const current = nodes.find((node) => node.id === active) ?? nodes[0];
  if (!current) return null;

  return (
    <Section id="architecture">
      <Container>
        <SectionHeader
          eyebrow="Systems"
          title="The whole path — not only the screens."
          kicker="Clients, API, data, and infrastructure as one map you can inspect."
        />
        <Reveal>
          <DiagramFrame>
            <p className="text-center font-mono text-[11px] tracking-[0.28em] text-subtle uppercase">
              {systemArchitecture[0]?.label ?? "Clients"}
            </p>
            <div className="mx-auto mt-5 grid max-w-2xl grid-cols-2 gap-3">
              {systemArchitecture[0]?.children?.map((child) => (
                <DiagramNode
                  key={child.id}
                  id={child.id}
                  label={child.label}
                  active={active === child.id}
                  onSelect={setActive}
                />
              ))}
            </div>
            <Connector />
            <p className="text-center font-mono text-[11px] tracking-[0.28em] text-subtle uppercase">
              {systemArchitecture[1]?.label ?? "API layer"}
            </p>
            <div className="mx-auto mt-5 max-w-sm">
              <DiagramNode
                id={systemArchitecture[1]?.children?.[0]?.id ?? "server"}
                label={systemArchitecture[1]?.children?.[0]?.label ?? "Node / NestJS"}
                active={active === (systemArchitecture[1]?.children?.[0]?.id ?? "server")}
                onSelect={setActive}
                wide
              />
            </div>
            <Connector />
            <p className="text-center font-mono text-[11px] tracking-[0.28em] text-subtle uppercase">
              {systemArchitecture[2]?.label ?? "Data"}
            </p>
            <div className="mx-auto mt-5 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {systemArchitecture[2]?.children?.map((child) => (
                <DiagramNode
                  key={child.id}
                  id={child.id}
                  label={child.label}
                  active={active === child.id}
                  onSelect={setActive}
                />
              ))}
            </div>
            <Connector />
            <div className="mx-auto max-w-sm">
              <DiagramNode
                id={systemArchitecture[3]?.id ?? "cloud"}
                label={systemArchitecture[3]?.label ?? "Cloud / Infra"}
                active={active === (systemArchitecture[3]?.id ?? "cloud")}
                onSelect={setActive}
                wide
              />
            </div>
            <motion.p
              key={current.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-muted md:text-base"
            >
              {current.detail}
            </motion.p>
            <p className="mt-3 text-center font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">
              {systemArchitecture.length} layers · production contracts
            </p>
          </DiagramFrame>
        </Reveal>
      </Container>
    </Section>
  );
}
