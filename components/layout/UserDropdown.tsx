"use client";

import { logout } from "@/app/auth-actions";
import type { NavUser } from "@/lib/auth/nav-user";
import { ChevronDown, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";

function getInitials(user: NavUser): string {
  const a = user.firstName?.charAt(0) ?? "";
  const b = user.lastName?.charAt(0) ?? "";
  if (a && b) return (a + b).toUpperCase();
  if (a) return a.toUpperCase().slice(0, 2);
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return "?";
}

function fullName(user: NavUser): string {
  const n = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (n) return n;
  return user.email.split("@")[0] || "Account";
}

type UserDropdownProps = {
  user: NavUser;
};

export function UserDropdown({ user }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useOnClickOutside(panelRef, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const initials = getInitials(user);
  const displayFirst = user.firstName?.trim() || user.email.split("@")[0] || "Account";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="flex max-w-[220px] items-center gap-2 rounded-lg py-1.5 pl-1 pr-2 text-left text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:text-gray-100 dark:hover:bg-gray-800 sm:max-w-none sm:pr-2"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        id={`${menuId}-trigger`}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground"
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden min-w-0 truncate sm:inline">{displayFirst}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${open ? "rotate-180" : ""}`}
          aria-hidden
          strokeWidth={2}
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-labelledby={`${menuId}-trigger`}
        className={`absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl border border-gray-200 bg-white py-2 shadow-lg transition-opacity duration-200 dark:border-gray-700 dark:bg-gray-900 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {fullName(user)}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>

        <div className="py-1">
          <Link
            href="/dashboard"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-brand dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="size-4 shrink-0" aria-hidden strokeWidth={2} />
            Dashboard
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-brand dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand"
            onClick={() => setOpen(false)}
          >
            <Settings className="size-4 shrink-0" aria-hidden strokeWidth={2} />
            Settings
          </Link>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800" />

        <div className="py-1">
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
