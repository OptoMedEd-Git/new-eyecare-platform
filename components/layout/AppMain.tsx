"use client";

import { useSideNav } from "@/lib/contexts/SideNavContext";
import type { ReactNode } from "react";

/**
 * Pushes main + footer together when the sidebar is locked (md+).
 * Pass server-rendered `<main>` and `<Footer />` as children from the (app) layout.
 */
export function AppMain({ children }: { children: ReactNode }) {
  const { isLocked } = useSideNav();

  return (
    <div
      className={
        "flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out " +
        (isLocked ? "md:ml-[280px]" : "md:ml-0")
      }
    >
      {children}
    </div>
  );
}
