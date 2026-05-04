"use client";

import { Bell } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useOnClickOutside(rootRef, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={panelId}
        aria-label="Notifications"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-text-body transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-5" aria-hidden strokeWidth={2} />
      </button>

      <div
        id={panelId}
        role="menu"
        className={`absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl border border-gray-200 bg-white p-4 shadow-lg transition-opacity duration-200 dark:border-gray-700 dark:bg-gray-900 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <p className="text-sm leading-relaxed text-text-body dark:text-gray-400">
          No notifications yet. We&apos;ll let you know when there are updates.
        </p>
      </div>
    </div>
  );
}
