"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";

type SiteContextValue = {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  theme: Theme;
  toggleTheme: () => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

const themeListeners = new Set<() => void>();

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function emitTheme() {
  themeListeners.forEach((listener) => listener());
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "dark" as Theme);

  const toggleTheme = useCallback(() => {
    applyTheme(readTheme() === "dark" ? "light" : "dark");
    emitTheme();
  }, []);

  const value = useMemo(
    () => ({
      commandOpen,
      setCommandOpen,
      terminalOpen,
      setTerminalOpen,
      theme,
      toggleTheme,
    }),
    [commandOpen, terminalOpen, theme, toggleTheme],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within SiteProvider");
  }
  return context;
}
