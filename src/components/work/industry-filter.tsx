"use client";

import { cn } from "@/lib/cn";
export type IndustryFilterOption = {
  id: string;
  label: string;
  count: number;
};

export function IndustryFilter({
  value,
  onChange,
  industries,
}: {
  value: string | "all";
  onChange: (value: string | "all") => void;
  industries: IndustryFilterOption[];
}) {
  const total = industries.reduce((sum, industry) => sum + industry.count, 0);

  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filter by industry"
    >
      <FilterChip
        selected={value === "all"}
        onClick={() => onChange("all")}
        label="All"
        count={total}
      />
      {industries.map((industry) => (
        <FilterChip
          key={industry.id}
          selected={value === industry.id}
          onClick={() => onChange(industry.id)}
          label={industry.label}
          count={industry.count}
        />
      ))}
    </div>
  );
}

function FilterChip({
  selected,
  onClick,
  label,
  count,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      data-cursor="link"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors duration-300",
        selected
          ? "border-accent bg-accent-soft text-accent"
          : "border-line text-subtle hover:border-line-strong hover:text-fg",
      )}
    >
      {label}
      <span className={cn("tabular-nums", selected ? "text-accent" : "text-subtle/80")}>
        {count}
      </span>
    </button>
  );
}
