"use client";

// TODO: add skip-to-content link for keyboard accessibility

import { AppNav } from "@/components/layout/AppNav";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarProvider";
import type { NavUser } from "@/lib/auth/nav-user";
import type { ReactNode } from "react";

function AppShellMain({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  const marginClass = collapsed ? "md:ml-[76px]" : "md:ml-[280px]";

  return (
    <div
      className={
        "ml-0 flex min-h-0 min-w-0 flex-1 flex-col transition-[margin-left] duration-200 ease-out " +
        marginClass
      }
    >
      {children}
    </div>
  );
}

export function AppShell({ user, children }: { user: NavUser; children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <AppNav user={user} />
        <AppShellMain>{children}</AppShellMain>
      </div>
    </SidebarProvider>
  );
}
