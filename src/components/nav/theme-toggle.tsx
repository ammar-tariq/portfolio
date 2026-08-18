"use client";

import { Moon, Sun } from "lucide-react";
import { useSite } from "@/components/providers/site-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useSite();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-fg transition-colors hover:border-accent ${className}`}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      data-cursor="link"
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
