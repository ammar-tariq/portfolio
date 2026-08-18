"use client";

import { RemoteImage } from "@/components/ui/remote-image";
import type { Project, ProjectScreenshot } from "@/types/content";
import { coverScreenshots } from "@/lib/project-media";
import { cn } from "@/lib/cn";

const visuals: Record<Project["visual"], string> = {
  dojo: "from-[#1a1610] via-[#0c0d11] to-[#0b1018]",
  glass: "from-[#1a1420] via-[#0d1016] to-[#12181f]",
  signal: "from-[#101820] via-[#0c1016] to-[#141014]",
  frame: "from-[#16120f] via-[#0e0f13] to-[#15110d]",
  hub: "from-[#10151c] via-[#0d1014] to-[#17140f]",
  map: "from-[#102018] via-[#0c1210] to-[#121418]",
  orbit: "from-[#10141c] via-[#0c0e12] to-[#141820]",
  horizon: "from-[#16140f] via-[#10110e] to-[#0c1016]",
  catalog: "from-[#0d1828] via-[#0c1218] to-[#152033]",
};

export function ProjectVisual({
  project,
  caption = true,
}: {
  project: Project;
  caption?: boolean;
}) {
  const shots = coverScreenshots(project);
  return (
    <div
      className={cn(
        "relative h-full min-h-[220px] overflow-hidden bg-linear-to-br [transform-style:preserve-3d]",
        visuals[project.visual],
      )}
    >
      <div className="hero-grid absolute inset-0 opacity-70" />
      {shots.length > 0 ? (
        <>
          <ScreenshotStack screenshots={shots} />
          {project.logo ? (
            <AppIcon src={project.logo} alt={`${project.title} app icon`} placement="overlay" />
          ) : null}
        </>
      ) : project.logo ? (
        <AppIcon src={project.logo} alt={`${project.title} app icon`} placement="hero" caption={caption} />
      ) : project.banner ? (
        <RemoteImage
          src={project.banner}
          alt={`${project.title} banner`}
          fill
          sizes="(max-width: 768px) 100vw, 960px"
          className="object-cover"
        />
      ) : (
        <>
          {project.visual === "dojo" && <Dojo />}
          {project.visual === "glass" && <Orbs />}
          {project.visual === "signal" && <Rings />}
          {project.visual === "frame" && <Frames />}
          {project.visual === "hub" && <Hub />}
          {project.visual === "map" && <Pins />}
          {project.visual === "orbit" && <Orbit />}
          {project.visual === "horizon" && <Horizon />}
          {project.visual === "catalog" && <Catalog />}
        </>
      )}
      {caption && shots.length === 0 && !project.logo && !project.banner ? (
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <p className="font-mono text-[10px] tracking-[0.24em] text-accent uppercase">
            {project.year ?? "Selected"}
          </p>
          <p className="mt-1 font-serif text-2xl text-fg sm:text-3xl">{project.title}</p>
        </div>
      ) : null}
    </div>
  );
}

function Dojo() {
  return (
    <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
      <div className="h-40 w-40 rounded-full border border-accent/30 [transform:translateZ(18px)]" />
      <div className="absolute h-24 w-24 rotate-45 border border-accent/20 [transform:translateZ(36px)_rotateX(18deg)]" />
      <div className="absolute h-1.5 w-28 bg-accent/70 [transform:translateZ(48px)]" />
    </div>
  );
}

function Orbs() {
  return (
    <>
      <div className="absolute top-10 left-10 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
      <div className="absolute right-8 bottom-16 h-36 w-36 rounded-full bg-accent-2/20 blur-3xl" />
    </>
  );
}

function Rings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-accent-2/25"
          style={{ width: i * 72, height: i * 72, transform: `translateZ(${i * 16}px)` }}
        />
      ))}
    </div>
  );
}

function Frames() {
  return (
    <div className="absolute inset-8 grid grid-cols-3 gap-2 opacity-60 [transform:translateZ(20px)]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-accent/25" />
      ))}
    </div>
  );
}

function Hub() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6 [transform-style:preserve-3d]">
      <div className="h-24 w-20 rounded-xl border border-line-strong [transform:rotateY(-18deg)_translateZ(12px)]" />
      <div className="h-28 w-20 rounded-xl border border-accent/40 [transform:rotateY(18deg)_translateZ(28px)]" />
    </div>
  );
}

function Pins() {
  return (
    <div className="absolute inset-0">
      {[
        [30, 32],
        [58, 28],
        [44, 52],
        [68, 60],
      ].map(([l, t], i) => (
        <div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-accent shadow-[0_0_16px_var(--glow)]"
          style={{ left: `${l}%`, top: `${t}%` }}
        />
      ))}
    </div>
  );
}

function Orbit() {
  return <div className="absolute inset-12 rounded-full border border-dashed border-line-strong [transform:rotateX(58deg)]" />;
}

function Horizon() {
  return <div className="absolute right-0 bottom-24 left-0 h-px bg-accent/40 [transform:rotateX(70deg)]" />;
}

function Catalog() {
  return (
    <div className="absolute inset-8 grid grid-cols-3 gap-2 opacity-50 [transform:translateZ(16px)]">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-md border border-accent/25 bg-accent/5" />
      ))}
    </div>
  );
}

function AppIcon({
  src,
  alt,
  placement,
  caption,
}: {
  src: string;
  alt: string;
  placement: "overlay" | "hero";
  caption?: boolean;
}) {
  const icon = (
    <div
      className={cn(
        "relative overflow-hidden bg-black shadow-[0_18px_40px_rgba(0,0,0,0.5)]",
        "rounded-[22.5%]",
        placement === "hero"
          ? "h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 [transform:translateZ(32px)]"
          : "h-[4.5rem] w-[4.5rem] sm:h-24 sm:w-24 md:h-[6.5rem] md:w-[6.5rem] [transform:translateZ(56px)]",
      )}
    >
      <RemoteImage src={src} alt={alt} fill sizes="160px" className="object-cover" />
      <span className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/18 to-transparent opacity-50" />
    </div>
  );

  if (placement === "overlay") {
    return <div className="absolute bottom-5 left-5 z-10 sm:bottom-7 sm:left-7">{icon}</div>;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
      <div className="absolute h-44 w-44 rounded-full bg-accent/25 blur-3xl" />
      <div className="absolute h-28 w-28 translate-x-10 rounded-full bg-accent-2/20 blur-3xl" />
      <div className={cn("relative", caption && "-translate-y-5")}>{icon}</div>
    </div>
  );
}

function ScreenshotStack({ screenshots }: { screenshots: ProjectScreenshot[] }) {
  const shots =
    screenshots.length >= 3
      ? [screenshots[0], screenshots[1], screenshots[screenshots.length - 1]]
      : screenshots;
  const poses =
    shots.length === 1
      ? [{ x: "0%", rotate: 0, z: 36, scale: 1, layer: 3 }]
      : shots.length === 2
        ? [
            { x: "-16%", rotate: -8, z: 20, scale: 0.9, layer: 1 },
            { x: "16%", rotate: 8, z: 32, scale: 1, layer: 2 },
          ]
        : [
            { x: "-24%", rotate: -10, z: 16, scale: 0.84, layer: 1 },
            { x: "0%", rotate: 0, z: 40, scale: 1, layer: 3 },
            { x: "24%", rotate: 10, z: 16, scale: 0.84, layer: 1 },
          ];

  return (
    <div className="absolute inset-0 flex items-center justify-center [perspective:1400px]">
      <div className="absolute top-8 left-10 h-28 w-28 rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute right-8 bottom-10 h-32 w-32 rounded-full bg-accent-2/20 blur-3xl" />
      <div className="relative flex h-full w-full items-center justify-center max-md:translate-y-1 md:translate-x-[6%]">
      {shots.map((shot, i) => (
        <div
          key={shot.src}
          className="absolute aspect-[9/19.5] h-[78%] overflow-hidden rounded-[1.25rem] border border-white/18 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          style={{
            zIndex: poses[i].layer,
            transform: `translateX(${poses[i].x}) rotate(${poses[i].rotate}deg) translateZ(${poses[i].z}px) scale(${poses[i].scale})`,
          }}
        >
          <RemoteImage
            src={shot.src}
            alt={shot.alt}
            fill
            sizes="180px"
            className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 motion-reduce:transform-none"
          />
        </div>
      ))}
      </div>
    </div>
  );
}

