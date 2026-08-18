"use client";

import { useState } from "react";
import { RemoteImage } from "@/components/ui/remote-image";
import type { Project, ProjectScreenshot } from "@/types/content";
import {
  androidScreenshots,
  hostedVideoSrc,
  iosScreenshots,
  videoEmbedSrc,
} from "@/lib/project-media";
import { cn } from "@/lib/cn";

function ScreenshotGrid({ screenshots }: { screenshots: ProjectScreenshot[] }) {
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {screenshots.map((shot) => (
        <li key={shot.src}>
          <figure className="overflow-hidden rounded-[1.35rem] border border-line bg-bg-elevated/50 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
            <div className="relative aspect-[9/19.5] bg-bg-soft">
              <RemoteImage
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 180px"
                className="object-cover object-top"
              />
            </div>
            {shot.caption ? (
              <figcaption className="border-t border-line px-3 py-2 text-center text-xs text-muted">
                {shot.caption}
              </figcaption>
            ) : null}
          </figure>
        </li>
      ))}
    </ul>
  );
}

function ProjectVideo({ project, heading = "h3" }: { project: Project; heading?: "h2" | "h3" }) {
  const embed = videoEmbedSrc(project);
  const file = hostedVideoSrc(project);
  if (!embed && !file) return null;
  const Heading = heading;
  return (
    <section className="mt-14">
      <Heading className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Video</Heading>
      <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-line bg-bg-elevated/50">
        {embed ? (
          <div className="relative aspect-video">
            <iframe
              src={embed}
              title={`${project.title} video`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video src={file} controls playsInline className="aspect-video w-full bg-bg-soft" />
        )}
      </div>
    </section>
  );
}

function ScreenshotPlatforms({
  project,
  heading = "h3",
}: {
  project: Project;
  heading?: "h2" | "h3";
}) {
  const ios = iosScreenshots(project);
  const android = androidScreenshots(project);
  const hasIos = ios.length > 0;
  const hasAndroid = android.length > 0;
  const [platform, setPlatform] = useState<"ios" | "android">(hasIos ? "ios" : "android");

  if (!hasIos && !hasAndroid) return null;

  const Heading = heading;
  const shots = platform === "ios" ? ios : android;

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Screenshots</Heading>
        <div className="flex gap-2" role="tablist" aria-label="Screenshot platform">
          <PlatformTab
            selected={platform === "ios"}
            onClick={() => hasIos && setPlatform("ios")}
            label="iOS"
            disabled={!hasIos}
          />
          <PlatformTab
            selected={platform === "android"}
            onClick={() => hasAndroid && setPlatform("android")}
            label="Android"
            disabled={!hasAndroid}
          />
        </div>
      </div>
      <ScreenshotGrid screenshots={shots} />
    </section>
  );
}

function PlatformTab({
  selected,
  onClick,
  label,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      onClick={onClick}
      data-cursor={disabled ? undefined : "link"}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors duration-300",
        disabled
          ? "cursor-not-allowed border-line text-subtle/40"
          : selected
            ? "border-accent bg-accent-soft text-accent"
            : "border-line text-subtle hover:border-line-strong hover:text-fg",
      )}
    >
      {label}
    </button>
  );
}

export function ProjectMedia({
  project,
  heading = "h3",
}: {
  project: Project;
  heading?: "h2" | "h3";
}) {
  return (
    <>
      <ProjectVideo project={project} heading={heading} />
      <ScreenshotPlatforms project={project} heading={heading} />
    </>
  );
}
