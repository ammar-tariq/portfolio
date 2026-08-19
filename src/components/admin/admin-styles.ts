import { cn } from "@/lib/cn";

export type AdminButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function adminButtonClass(variant: AdminButtonVariant = "primary") {
  const base =
    "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";
  if (variant === "primary") return cn(base, "bg-fg text-bg hover:bg-accent hover:text-bg");
  if (variant === "danger") return cn(base, "border border-line text-red-400 hover:border-red-400/50 hover:bg-red-400/10");
  if (variant === "ghost") return cn(base, "text-muted hover:bg-fg/6 hover:text-fg");
  return cn(base, "border border-line bg-bg-elevated text-fg hover:border-line-strong hover:bg-fg/6");
}
