"use client";

import { createContext, useContext, useMemo, useState } from "react";

type SkillFocusValue = {
  skill: string | null;
  setSkill: (skill: string | null) => void;
};

const SkillFocusContext = createContext<SkillFocusValue>({
  skill: null,
  setSkill: () => {},
});

export function SkillFocusProvider({ children }: { children: React.ReactNode }) {
  const [skill, setSkill] = useState<string | null>(null);
  const value = useMemo(() => ({ skill, setSkill }), [skill]);
  return <SkillFocusContext.Provider value={value}>{children}</SkillFocusContext.Provider>;
}

export function useSkillFocus() {
  return useContext(SkillFocusContext);
}
