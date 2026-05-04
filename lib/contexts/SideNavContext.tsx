"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type SideNavContextValue = {
  isLocked: boolean;
  setLocked: Dispatch<SetStateAction<boolean>>;
};

const SideNavContext = createContext<SideNavContextValue | null>(null);

export function SideNavProvider({ children }: { children: ReactNode }) {
  const [isLocked, setLocked] = useState(false);
  const value = useMemo(() => ({ isLocked, setLocked }), [isLocked]);
  return <SideNavContext.Provider value={value}>{children}</SideNavContext.Provider>;
}

export function useSideNav() {
  const ctx = useContext(SideNavContext);
  if (!ctx) {
    throw new Error("useSideNav must be used within a SideNavProvider");
  }
  return ctx;
}
