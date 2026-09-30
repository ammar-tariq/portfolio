"use client";

import type { LucideIcon } from "lucide-react";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/cn";
import { industryIcon } from "@/lib/marks";

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
      className="-mx-1 flex gap-x-5 gap-y-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filter by industry"
    >
      <FilterChip selected={value === "all"} onClick={() => onChange("all")} label="All" count={total} icon={LayoutGrid} />
      {industries.map((industry) => (
        <FilterChip
          key={industry.id}
          selected={value === industry.id}
          onClick={() => onChange(industry.id)}
          label={industry.label}
          count={industry.count}
          icon={industryIcon(industry.id)}
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
  icon: Icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      data-cursor="link"
      className={cn(
        "meta-label inline-flex shrink-0 items-center gap-1.5 border-b pb-1 transition-colors duration-[var(--dur)]",
        selected ? "border-accent text-fg" : "border-transparent text-subtle hover:text-fg",
      )}
    >
      <Icon className="h-3.5 w-3.5 text-accent" aria-hidden />
      {label}
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
