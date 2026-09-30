"use client";

import { useSite } from "@/components/providers/site-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useSite();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`meta-label text-fg transition-colors duration-[var(--dur)] hover:text-accent ${className}`}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      data-cursor="link"
    >
      {isLight ? "Dark" : "Light"}
    </button>
  );
}
