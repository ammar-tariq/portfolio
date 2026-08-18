"use client";

import { createContext, useContext } from "react";
import type { SiteContent } from "@/types/content";

const ContentContext = createContext<SiteContent | null>(null);

export function ContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: React.ReactNode;
}) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const content = useContext(ContentContext);
  if (!content) {
    throw new Error("useContent must be used within ContentProvider");
  }
  return content;
}
