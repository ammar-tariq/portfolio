"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Html, Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { scrollToSection } from "@/lib/scroll";

type Pose = {
  pointer: { current: { x: number; y: number } };
  scroll: { current: number };
  compact: boolean;
  light: boolean;
};

const DESKTOP_SCALE = 0.62;
const SCROLLED_SCALE = 0.34;

const TS = "#3178C6";

const ORBITS = [
  { id: "clients", rotation: [0.55, 0.15, 0] as [number, number, number], color: "#4fbbf2" },
  { id: "backend", rotation: [0.55, 0.15, (2 * Math.PI) / 3] as [number, number, number], color: "#1a8ee8" },
  { id: "data", rotation: [0.55, 0.15, (4 * Math.PI) / 3] as [number, number, number], color: "#1558d2" },
] as const;

const ELECTRONS = [
  { id: "native", label: "Native", href: "#skill-mobile", orbit: "clients", color: "#61DAFB", speed: 0.44, offset: 0 },
  { id: "react", label: "React", href: "#skill-frontend", orbit: "clients", color: "#149ECA", speed: 0.44, offset: (2 * Math.PI) / 3 },
  { id: "next", label: "Next.js", href: "#skill-frontend", orbit: "clients", color: "#F4F7FB", speed: 0.44, offset: (4 * Math.PI) / 3 },
  { id: "node", label: "Node.js", href: "#skill-backend", orbit: "backend", color: "#339933", speed: 0.34, offset: 0 },
  { id: "express", label: "Express", href: "#skill-backend", orbit: "backend", color: "#EDEDED", speed: 0.34, offset: Math.PI / 2 },
  { id: "nest", label: "Nest", href: "#skill-backend", orbit: "backend", color: "#E0234E", speed: 0.34, offset: Math.PI },
  { id: "llm", label: "LLM", href: "#skill-ai", orbit: "backend", color: "#8B5CF6", speed: 0.34, offset: (3 * Math.PI) / 2 },
  { id: "pg", label: "PG", href: "#skill-databases", orbit: "data", color: "#336791", speed: 0.26, offset: 0 },
  { id: "mongo", label: "Mongo", href: "#skill-databases", orbit: "data", color: "#47A248", speed: 0.26, offset: (2 * Math.PI) / 3 },
  { id: "redis", label: "Redis", href: "#skill-databases", orbit: "data", color: "#DC382D", speed: 0.26, offset: (4 * Math.PI) / 3 },
] as const;

const RX = 2.15;
const RY = 0.86;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

function orbitPoints(segments = 160) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * RX, Math.sin(angle) * RY, 0));
  }
  return points;
}

function electronColor(id: string, color: string, light: boolean) {
  if (id === "next" || id === "express") return light ? "#0c1220" : "#F4F7FB";
  if (id === "react") return light ? "#087ea4" : color;
  if (id === "native") return light ? "#0ea5c6" : color;
  if (id === "node") return light ? "#2e7d32" : color;
  return color;
}

function Label({ children, show, compact }: { children: string; show: boolean; compact?: boolean }) {
  return (
    <Html
      center
      sprite
      occlude={false}
      pointerEvents="none"
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      <span
        className="mt-5 inline-flex rounded-full border border-line-strong bg-bg-elevated px-2 py-0.5 font-mono tracking-[0.14em] text-fg uppercase shadow-[0_8px_24px_rgba(12,18,32,0.18)]"
        style={{
          fontSize: compact ? 10 : 9,
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 280ms ease, transform 280ms ease",
        }}
      >
        {children}
      </span>
    </Html>
  );
}

function pickHits(root: THREE.Object3D, camera: THREE.Camera, clientX: number, clientY: number) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(root, true);
  const href = hits.find((hit) => typeof hit.object.userData.href === "string");
  return {
    href,
    id: typeof href?.object.userData.id === "string" ? (href.object.userData.id as string) : null,
    overModel: hits.some(
      (hit) => hit.object.userData.pause === true || typeof hit.object.userData.href === "string",
    ),
  };
}

function isChromeTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return true;
  return Boolean(
    el.closest("a, button, input, textarea, [role='dialog'], header, h1, [data-cursor='link']"),
  );
}

function overHero(clientY: number) {
  const hero = document.getElementById("hero");
  if (!hero) return false;
  const rect = hero.getBoundingClientRect();
  return clientY >= rect.top && clientY <= rect.bottom;
}

function Hits({
  root,
  paused,
  onPausedChange,
}: {
  root: RefObject<THREE.Group | null>;
  paused: RefObject<boolean>;
  onPausedChange: (value: boolean) => void;
}) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const setPaused = (value: boolean) => {
      if (paused.current === value) return;
      paused.current = value;
      onPausedChange(value);
    };

    const onMove = (event: PointerEvent) => {
      if (!root.current || isChromeTarget(event.target) || !overHero(event.clientY)) {
        document.documentElement.dataset.atomHit = "0";
        setPaused(false);
        return;
      }
      const { href, overModel } = pickHits(root.current, camera, event.clientX, event.clientY);
      document.documentElement.dataset.atomHit = href ? "1" : "0";
      setPaused(overModel);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!root.current || (event.pointerType === "mouse" && event.button !== 0)) return;
      if (isChromeTarget(event.target) || !overHero(event.clientY)) return;
      const href = pickHits(root.current, camera, event.clientX, event.clientY).href?.object.userData.href as
        | string
        | undefined;
      if (!href) return;
      event.preventDefault();
      window.history.replaceState(null, "", href);
      scrollToSection(href);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      document.documentElement.dataset.atomHit = "0";
      paused.current = false;
      onPausedChange(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [camera, onPausedChange, paused, root]);

  return null;
}

function Electron({
  id,
  speed,
  offset,
  color,
  label,
  href,
  elapsed,
  showLabel,
  compact,
  light,
}: {
  id: string;
  speed: number;
  offset: number;
  color: string;
  label: string;
  href: string;
  elapsed: RefObject<number>;
  showLabel: boolean;
  compact: boolean;
  light: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const tint = electronColor(id, color, light);

  useFrame(() => {
    if (!ref.current) return;
    const t = elapsed.current * speed + offset;
    ref.current.position.set(Math.cos(t) * RX, Math.sin(t) * RY, 0);
  });

  return (
    <group ref={ref}>
      <mesh userData={{ href, id }}>
        <sphereGeometry args={[compact ? 0.3 : 0.2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.042, 20, 20]} />
        <meshStandardMaterial
          color={tint}
          metalness={0.2}
          roughness={light ? 0.28 : 0.12}
          emissive={tint}
          emissiveIntensity={light ? 0.7 : 1.35}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshBasicMaterial color={tint} transparent opacity={light ? 0.32 : 0.22} depthWrite={false} />
      </mesh>
      <Label show={showLabel} compact={compact}>
        {label}
      </Label>
    </group>
  );
}

export function Atom({ pointer, scroll, compact, light }: Pose) {
  const group = useRef<THREE.Group>(null);
  const paused = useRef(false);
  const elapsed = useRef(0);
  const [held, setHeld] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const points = useMemo(() => orbitPoints(), []);
  const restScale = compact ? SCROLLED_SCALE : DESKTOP_SCALE;
  const restX = compact ? 1.08 : 1.55;
  const restY = compact ? 0.82 : 0.18;
  const orbitTone = light ? 0.78 : 0.5;

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowLabels(entry.isIntersecting && entry.intersectionRatio >= 0.22),
      { threshold: [0, 0.12, 0.22, 0.4, 0.7, 1] },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (paused.current) return;
    elapsed.current += delta;
    const depth = compact ? 0 : scroll.current;
    const targetY = compact ? 0.12 : pointer.current.x * 0.42 + 0.12;
    const targetX = compact ? 0 : pointer.current.y * 0.22;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.05);
    group.current.rotation.z += delta * 0.09;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, restX + depth * 0.9, 0.06);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, restY + depth * 0.7, 0.06);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, depth * -2.4, 0.06);
    const scale = compact ? restScale : THREE.MathUtils.lerp(DESKTOP_SCALE, SCROLLED_SCALE, depth);
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, scale, 0.06));
  });

  return (
    <Float enabled={!held} speed={compact ? 0.85 : 1.1} rotationIntensity={compact ? 0.06 : 0.12} floatIntensity={compact ? 0.22 : 0.35}>
      <group ref={group} position={[restX, restY, 0]} scale={restScale}>
        <Hits root={group} paused={paused} onPausedChange={setHeld} />
        <mesh userData={{ pause: true }}>
          <sphereGeometry args={[2.38, 20, 20]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh userData={{ href: "#skill-frontend", id: "typescript" }}>
          <sphereGeometry args={[0.4, 24, 24]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshBasicMaterial color={TS} transparent opacity={light ? 0.12 : 0.055} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.52, 32, 32]} />
          <meshBasicMaterial color={TS} transparent opacity={light ? 0.26 : 0.14} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.32, 48, 48]} />
          <meshPhysicalMaterial
            color={TS}
            roughness={light ? 0.28 : 0.16}
            metalness={0.42}
            emissive={TS}
            emissiveIntensity={light ? 0.55 : 0.9}
            clearcoat={1}
            clearcoatRoughness={0.12}
            reflectivity={0.6}
          />
        </mesh>
        <group position={[0, -0.58, 0]}>
          <Label show={showLabels} compact={compact}>
            TypeScript
          </Label>
        </group>
        <Sparkles
          count={compact ? 14 : 32}
          scale={compact ? [3.2, 2.4, 2.6] : [4.4, 3.2, 3.6]}
          size={compact ? 1.8 : 2.6}
          speed={held ? 0 : 0.35}
          opacity={light ? 0.35 : 0.5}
          color={light ? "#1566d2" : TS}
        />
        {ORBITS.map((orbit) => (
          <group key={orbit.id} rotation={orbit.rotation}>
            <Line
              points={points}
              color={light ? "#1566d2" : orbit.color}
              lineWidth={light ? 1.4 : 1.15}
              transparent
              opacity={orbitTone}
              raycast={() => null}
            />
            {ELECTRONS.filter((electron) => electron.orbit === orbit.id).map((electron) => (
              <Electron
                key={electron.id}
                id={electron.id}
                speed={electron.speed}
                offset={electron.offset}
                color={electron.color}
                label={electron.label}
                href={electron.href}
                elapsed={elapsed}
                showLabel={showLabels}
                compact={compact}
                light={light}
              />
            ))}
          </group>
        ))}
      </group>
    </Float>
  );
}
