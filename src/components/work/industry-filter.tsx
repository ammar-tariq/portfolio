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
      className="-mx-1 flex gap-x-5 gap-y-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filter by industry"
    >
      <FilterChip selected={value === "all"} onClick={() => onChange("all")} label="All" count={total} />
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
        "meta-label shrink-0 border-b pb-1 transition-colors duration-[var(--dur)]",
        selected ? "border-accent text-fg" : "border-transparent text-subtle hover:text-fg",
      )}
    >
      {label}
      <span className="ml-1.5 tabular-nums">{count}</span>
    </button>
  );
}
