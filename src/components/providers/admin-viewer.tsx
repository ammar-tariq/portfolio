"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AdminViewerContext = createContext(false);

export function AdminViewerProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/session", { credentials: "same-origin" })
      .then((response) => {
        if (!cancelled) setIsAdmin(response.ok);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <AdminViewerContext.Provider value={isAdmin}>{children}</AdminViewerContext.Provider>;
}

export function useAdminViewer() {
  return useContext(AdminViewerContext);
}
