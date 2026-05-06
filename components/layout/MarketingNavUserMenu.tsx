"use client";

import type { NavUser } from "@/lib/auth/nav-user";
import { UserDropdownMenu } from "@/components/layout/UserDropdownMenu";
import { ChevronDown } from "lucide-react";
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

export function MarketingNavUserMenu({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const initials = getInitials(user);
  const firstName = user.firstName?.trim() || user.email.split("@")[0] || "there";

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [open]);

  return (
    <div className="relative flex items-center" ref={ref}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-base p-2.5 transition-colors hover:bg-bg-secondary-soft"
          aria-label="User menu"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          id={`${menuId}-trigger`}
        >
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-bg-brand text-[9px] font-medium text-text-on-brand">
            {initials}
          </span>
          <span className="hidden text-sm font-medium leading-5 text-text-body sm:inline">
            Hi, {firstName}!
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-text-body transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
            strokeWidth={2}
          />
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-1.5 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium leading-5 text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
        >
          Go to app
        </Link>
      </div>

      {open ? (
        <UserDropdownMenu
          id={menuId}
          ariaLabelledBy={`${menuId}-trigger`}
          className="absolute left-0 top-full mt-2"
          onItemClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

