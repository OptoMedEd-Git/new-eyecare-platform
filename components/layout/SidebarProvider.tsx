"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

type SidebarContextValue = {
  /** Persistent: user's preference for collapsed/expanded on desktop */
  collapsed: boolean;
  /** Runtime: user is hovering a collapsed sidebar — temporarily expand */
  hovered: boolean;
  /** Runtime: mobile drawer is open */
  mobileOpen: boolean;
  /** Toggle the persistent collapsed preference */
  toggleCollapsed: () => void;
  /** Set hover state */
  setHovered: Dispatch<SetStateAction<boolean>>;
  /** Toggle mobile drawer */
  toggleMobileOpen: () => void;
  /** Close mobile drawer (e.g., on route change or outside click) */
  closeMobile: () => void;
  /** Collapse sidebar, clear hover, close mobile — e.g. Escape or nav link */
  collapse: () => void;
  /** Whether the sidebar should currently render in expanded form (collapsed=false OR hovered=true OR mobileOpen=true) */
  isExpanded: boolean;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "sidebar-collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "true") setCollapsed(true);
      } catch {
        // localStorage unavailable (privacy mode, etc.) — accept the default
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed, hydrated]);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);
  const toggleMobileOpen = useCallback(() => setMobileOpen((o) => !o), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const collapse = useCallback(() => {
    setCollapsed(true);
    setHovered(false);
    setMobileOpen(false);
  }, []);

  const isExpanded = !collapsed || hovered || mobileOpen;

  const value: SidebarContextValue = {
    collapsed,
    hovered,
    mobileOpen,
    toggleCollapsed,
    setHovered,
    toggleMobileOpen,
    closeMobile,
    collapse,
    isExpanded,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}
