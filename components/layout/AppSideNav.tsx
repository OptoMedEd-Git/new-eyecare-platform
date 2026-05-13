"use client";

import { SidebarItem } from "@/components/layout/SidebarItem";
import { useSidebar } from "@/components/layout/SidebarProvider";
import { ViewSwitcherSlot } from "@/components/layout/ViewSwitcherSlot";
import type { NavUser } from "@/lib/auth/nav-user";
import { getNavItems } from "@/lib/nav/get-nav-items";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export type AppSideNavProps = {
  user: NavUser;
};

export function AppSideNav({ user }: AppSideNavProps) {
  const pathname = usePathname();
  const { collapsed, hovered, mobileOpen, setHovered, closeMobile } = useSidebar();

  const { primary, secondary } = getNavItems({ role: user.role, pathname, viewMode: user.viewMode });

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const isMobileDrawer = mobileOpen;
  const isCollapsed = collapsed && !hovered && !mobileOpen;

  return (
    <>
      {isMobileDrawer ? (
        <div
          className="fixed inset-0 z-30 bg-bg-inverse/40 md:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      ) : null}

      <aside
        id="side-nav"
        onMouseEnter={() => {
          if (collapsed) setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
        className={[
          "fixed left-0 top-[65px] z-40 h-[calc(100vh-65px)] overflow-y-auto border-r border-border-default bg-bg-primary-soft",
          "transition-[width,transform] duration-200 ease-out",
          isCollapsed ? "w-[76px]" : "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        aria-label="Main navigation"
      >
        <div className="flex flex-col gap-6 p-5">
          {user.role === "admin" ? <ViewSwitcherSlot currentMode={user.viewMode} /> : null}

          <nav className="flex w-full flex-col gap-2" aria-label="Primary">
            {primary.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                expanded={!isCollapsed}
                pathname={pathname}
                onNavigate={closeMobile}
              />
            ))}
          </nav>

          <nav
            className="flex w-full flex-col gap-2 border-t border-border-divider pt-4"
            aria-label="Secondary"
          >
            {secondary.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                expanded={!isCollapsed}
                pathname={pathname}
                onNavigate={closeMobile}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
