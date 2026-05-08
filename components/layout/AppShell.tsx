"use client";

// TODO: add skip-to-content link for keyboard accessibility

import { AppNav } from "@/components/layout/AppNav";
import { AppSideNav } from "@/components/layout/AppSideNav";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarProvider";
import type { NavUser } from "@/lib/auth/nav-user";
import type { ReactNode } from "react";

function AppShellMain({ children }: { children: ReactNode }) {
  const { collapsed, hovered, mobileOpen } = useSidebar();

  const isCollapsed = collapsed && !hovered && !mobileOpen;
  const paddingClass = isCollapsed ? "md:pl-[76px]" : "md:pl-[280px]";

  return (
    <div
      className={
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pt-[65px] transition-[padding-left] duration-200 ease-out " +
        paddingClass
      }
    >
      {children}
    </div>
  );
}

export function AppShell({ user, children }: { user: NavUser; children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex h-screen min-h-0 flex-col overflow-hidden">
        <header className="fixed inset-x-0 top-0 z-40 h-[65px] w-full border-b border-border-default bg-bg-primary-soft">
          <AppNav user={user} />
        </header>

        <AppSideNav user={{ role: user.role }} />

        <AppShellMain>{children}</AppShellMain>
      </div>
    </SidebarProvider>
  );
}
