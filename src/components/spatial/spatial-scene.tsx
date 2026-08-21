"use client";

import { Component, useEffect, useMemo, useRef, useSyncExternalStore, type ErrorInfo, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useSite } from "@/components/providers/site-provider";
import { useLenis } from "lenis/react";
import { Atom } from "./models/atom";
import { useIsDesktop } from "@/lib/use-media-query";

type Pose = {
  pointer: { current: { x: number; y: number } };
  scroll: { current: number };
  compact: boolean;
};

function dustPositions(count: number) {
  const array = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const n = i + 1;
    array[i * 3] = (Math.sin(n * 12.9898) * 43758.5453 - Math.floor(Math.sin(n * 12.9898) * 43758.5453) - 0.5) * 22;
    array[i * 3 + 1] =
      (Math.sin(n * 78.233) * 43758.5453 - Math.floor(Math.sin(n * 78.233) * 43758.5453) - 0.5) * 14;
    array[i * 3 + 2] =
      (Math.sin(n * 45.164) * 43758.5453 - Math.floor(Math.sin(n * 45.164) * 43758.5453) - 0.5) * 12 - 1;
  }
  return array;
}

function Dust({ light, compact }: { light: boolean; compact: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => dustPositions(compact ? 120 : light ? 180 : 520), [compact, light]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.018;
    ref.current.rotation.x += delta * 0.004;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={light ? 0.024 : 0.028}
        color={light ? "#1566d2" : "#4fbbf2"}
        transparent
        opacity={light ? 0.32 : compact ? 0.28 : 0.38}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Rig({ pointer, scroll, compact }: Pose) {
  useFrame((state, delta) => {
    const { camera } = state;
    const depth = compact ? 0 : Number.isFinite(scroll.current) ? scroll.current : 0;
    const px = compact ? 0 : pointer.current.x * 0.45;
    const py = compact ? 0.12 : 0.12 + pointer.current.y * 0.22;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px, 2.4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, py, 2.4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 6.2 + depth * 1.8, 2.2, delta);
    camera.lookAt(0.35, 0.05, 0);
  });
  return null;
}

function Scene({ theme, compact }: { theme: "light" | "dark"; compact: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const light = theme === "light";

  useLenis((instance) => {
    const y = typeof instance.scroll === "number" ? instance.scroll : window.scrollY;
    const h = window.innerHeight || 1;
    const next = Math.min(1, Math.max(0, y / (h * 0.92)));
    scroll.current = Number.isFinite(next) ? next : 0;
  });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      const h = window.innerHeight || 1;
      const next = Math.min(1, Math.max(0, window.scrollY / (h * 0.92)));
      scroll.current = Number.isFinite(next) ? next : 0;
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <ambientLight intensity={light ? 0.85 : 0.32} />
      <directionalLight position={[4, 6, 5]} intensity={light ? 1.05 : 1.15} color={light ? "#ffffff" : "#4fbbf2"} />
      <directionalLight position={[-6, -2, 3]} intensity={light ? 0.55 : 0.45} color={light ? "#1566d2" : "#1558d2"} />
      <pointLight position={[1.5, 0.2, 1.4]} intensity={light ? 0.9 : 1.4} color="#1a8ee8" distance={8} />
      {!light ? (
        <Stars
          radius={70}
          depth={32}
          count={compact ? 280 : 850}
          factor={compact ? 2.4 : 3.1}
          saturation={0}
          fade
          speed={0.55}
        />
      ) : null}
      <Dust key={`${theme}-${compact ? "m" : "d"}`} light={light} compact={compact} />
      <Atom pointer={pointer} scroll={scroll} compact={compact} light={light} />
      <Rig pointer={pointer} scroll={scroll} compact={compact} />
    </>
  );
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

class WebGLGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("Spatial scene disabled", error.message, info.componentStack);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function subscribeWebGL() {
  return () => {};
}

function getServerWebGL() {
  return false;
}

// Cap the render loop well below 60fps. An uncapped `frameloop="always"` makes
// three.js redraw every frame — on software-rendered / throttled devices (like
// PageSpeed's emulated desktop) that's ~30s of main-thread work and a 21s TBT.
// ~24fps still reads as smooth ambient motion for a background, at a fraction
// of the cost.
const MAX_FPS = 24;

// Runs the three.js frame loop in "demand" mode but re-invalidates at MAX_FPS so
// the ambient animation stays alive while the per-frame GPU/CPU cost is capped.
function FrameLimiter() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const id = window.setInterval(() => invalidate(), 1000 / MAX_FPS);
    return () => window.clearInterval(id);
  }, [invalidate]);
  return null;
}

export default function SpatialScene() {
  const { theme, commandOpen } = useSite();
  const compact = !useIsDesktop();
  const playing = !commandOpen;
  const ok = useSyncExternalStore(subscribeWebGL, hasWebGL, getServerWebGL);

  if (!ok) return null;

  return (
    <div className="h-full w-full bg-transparent" data-cursor="hidden">
      <WebGLGuard>
        <Canvas
          dpr={compact ? [1, 1.15] : [1, 1.5]}
          frameloop={playing ? "demand" : "never"}
          style={{ background: "transparent" }}
          gl={{
            antialias: !compact,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl, scene }) => {
            scene.background = null;
            gl.setClearColor(0x000000, 0);
          }}
          camera={{ position: [0, 0.12, 6.2], fov: 34 }}
        >
          <Scene theme={theme} compact={compact} />
          {playing ? <FrameLimiter /> : null}
        </Canvas>
      </WebGLGuard>
    </div>
  );
}
