"use client";

import {
  BookMarked,
  BookOpen,
  ClipboardList,
  HelpCircle,
  Layers,
  LayoutGrid,
  Route,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";

const APP_LINKS = [
  { href: "/pathways", label: "Pathways", Icon: Route },
  { href: "/courses", label: "Courses", Icon: BookOpen },
  { href: "/quiz-bank", label: "Quiz Bank", Icon: HelpCircle },
  { href: "/flashcards", label: "Flashcards", Icon: Layers },
  { href: "/cases", label: "Cases", Icon: ClipboardList },
  { href: "/encyclopedia", label: "Encyclopedia", Icon: BookMarked },
] as const;

export function AppsGridButton() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useOnClickOutside(rootRef, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const cardClassName =
    "flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-center transition-all duration-200 hover:border-brand/30 hover:bg-blue-50/80 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-blue-500/40 dark:hover:bg-gray-800";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={menuId}
        aria-label="Open app launcher"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-text-body transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={() => setOpen((v) => !v)}
      >
        <LayoutGrid className="size-5" aria-hidden strokeWidth={2} />
      </button>

      <div
        id={menuId}
        role="dialog"
        aria-modal="false"
        aria-label="Platform shortcuts"
        className={`absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] origin-top-right rounded-xl border border-gray-200 bg-white p-3 shadow-lg transition-opacity duration-200 dark:border-gray-700 dark:bg-gray-900 sm:w-[22rem] ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Platform
        </p>
        <ul className="grid grid-cols-2 gap-2">
          {APP_LINKS.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cardClassName}
                onClick={() => setOpen(false)}
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-950/50">
                  <Icon className="size-5" aria-hidden strokeWidth={2} />
                </div>
                <span className="text-xs font-medium leading-tight text-gray-900 dark:text-gray-100">
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
