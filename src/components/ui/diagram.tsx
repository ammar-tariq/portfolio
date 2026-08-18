"use client";

import { cn } from "@/lib/cn";
import { TiltCard } from "@/components/ui/tilt";

export function DiagramFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="[perspective:1600px]">
      <TiltCard>
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-line bg-bg-elevated/70 p-4 backdrop-blur-sm sm:rounded-[28px] sm:p-5 md:p-10",
            className,
          )}
        >
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-45" />
          <div className="relative">{children}</div>
        </div>
      </TiltCard>
    </div>
  );
}

export function DiagramNode({
  id,
  label,
  active,
  onSelect,
  wide,
  kicker,
  className,
}: {
  id: string;
  label: string;
  active?: boolean;
  onSelect?: (id: string) => void;
  wide?: boolean;
  kicker?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(id)}
      data-cursor="link"
      className={cn(
        "min-w-0 rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 sm:px-4 sm:py-3",
        wide && "w-full text-center",
        active
          ? "border-accent bg-accent-soft text-accent shadow-[0_0_32px_var(--glow)]"
          : "border-line bg-bg/70 text-muted hover:border-line-strong hover:text-fg",
        className,
      )}
    >
      {kicker ? (
        <span className="mb-1 block font-mono text-[10px] tracking-[0.22em] text-subtle uppercase">
          {kicker}
        </span>
      ) : null}
      <span className="block text-sm tracking-tight break-words md:text-[15px]">{label}</span>
    </button>
  );
}

export function Connector() {
  return (
    <div
      className="mx-auto my-3 h-8 w-px bg-linear-to-b from-line-strong via-accent/55 to-accent/15"
      aria-hidden
    />
  );
}
