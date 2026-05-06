"use client";

import { AppSideNav } from "@/components/layout/AppSideNav";
import { useSidebar } from "@/components/layout/SidebarProvider";
import { UserDropdownMenu } from "@/components/layout/UserDropdownMenu";
import type { NavUser } from "@/lib/auth/nav-user";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

function getInitials(user: NavUser): string {
  const a = user.firstName?.charAt(0) ?? "";
  const b = user.lastName?.charAt(0) ?? "";
  if (a && b) return (a + b).toUpperCase();
  if (a) return a.toUpperCase().slice(0, 2);
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return "?";
}

export type AppNavProps = {
  user: NavUser;
};

function AppNavInner({ user }: AppNavProps) {
  const { toggleCollapsed, toggleMobileOpen, collapse, isExpanded } = useSidebar();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const initials = getInitials(user);
  const displayName = user.firstName?.trim() || user.email.split("@")[0] || "Account";

  useEffect(() => {
    if (!dropdownOpen) return;
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (dropdownOpen) {
        setDropdownOpen(false);
        return;
      }
      if (isExpanded) collapse();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dropdownOpen, isExpanded, collapse]);

  function handleHamburger() {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      toggleCollapsed();
    } else {
      toggleMobileOpen();
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border-default bg-bg-primary-soft">
        <div className="flex h-[65px] items-center justify-between px-5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleHamburger}
              className="flex size-6 items-center justify-center rounded-base text-text-body transition-colors hover:text-text-heading"
              aria-label="Toggle navigation"
              aria-expanded={isExpanded}
              aria-controls="side-nav"
            >
              <Menu className="size-5" aria-hidden />
            </button>

            <Link href="/" className="flex shrink-0 items-center gap-1 px-1.5 py-0.5 no-underline hover:no-underline">
              <Image
                src="/logos/logo.svg"
                alt=""
                width={30}
                height={30}
                className="size-[30px] shrink-0"
                unoptimized
              />
              <span className="text-2xl font-semibold leading-6 text-[#101828] dark:text-slate-200">OptoMedEd</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-base text-text-body transition-colors hover:text-text-heading"
              aria-label="Search (coming soon)"
              title="Search coming soon"
            >
              <Search className="size-[18px]" aria-hidden strokeWidth={2} />
            </button>

            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-base text-text-body transition-colors hover:text-text-heading"
              aria-label="Notifications"
            >
              <Bell className="size-5" aria-hidden strokeWidth={2} />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-base px-0.5 py-1 transition-colors hover:bg-bg-secondary-soft"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                aria-controls={menuId}
                id={`${menuId}-trigger`}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bg-brand text-[10px] font-medium text-text-on-brand">
                  {initials}
                </span>
                <span className="text-sm font-medium leading-5 text-text-body">{displayName}</span>
                <ChevronDown
                  className={`size-[18px] shrink-0 text-text-body transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  aria-hidden
                  strokeWidth={2}
                />
              </button>

              {dropdownOpen ? (
                <UserDropdownMenu
                  id={menuId}
                  ariaLabelledBy={`${menuId}-trigger`}
                  className="absolute right-0 top-full mt-2 origin-top-right"
                  onItemClick={() => setDropdownOpen(false)}
                />
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <AppSideNav user={{ role: user.role }} />
    </>
  );
}

export function AppNav(props: AppNavProps) {
  return <AppNavInner {...props} />;
}
