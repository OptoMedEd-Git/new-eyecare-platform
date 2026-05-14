"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";

import { setViewMode } from "@/app/actions/view-mode-actions";
import {
  type AdminViewMode,
  VIEW_MODE_DESCRIPTIONS,
  VIEW_MODE_LABELS,
  dashboardHrefForViewMode,
} from "@/lib/nav/view-mode";

type Props = { currentMode: AdminViewMode };

const ORDER: AdminViewMode[] = ["admin", "contributor", "user"];

export function ViewSwitcher({ currentMode }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSelect(mode: AdminViewMode) {
    if (mode === currentMode) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      const result = await setViewMode(mode);
      if (!result.success) return;
      setOpen(false);
      const href = dashboardHrefForViewMode(mode);
      // Cookie is set by the server action before we return; then navigate (or refresh if already on target) so the shell matches the new mode.
      if (pathname === href) {
        router.refresh();
      } else {
        router.push(href);
      }
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex w-full items-center justify-between gap-2 rounded-base border border-border-brand-subtle bg-bg-brand-softer px-3 py-2 text-sm font-medium text-text-fg-brand-strong transition-colors hover:bg-bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">{VIEW_MODE_LABELS[currentMode]}</span>
        <ChevronsUpDown className="size-4 shrink-0" aria-hidden />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Switch view"
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-base border border-border-default bg-bg-primary-soft shadow-md"
        >
          {ORDER.map((mode) => {
            const isCurrent = mode === currentMode;
            return (
              <button
                key={mode}
                type="button"
                role="option"
                aria-selected={isCurrent}
                onClick={() => handleSelect(mode)}
                disabled={isPending}
                className={[
                  "flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left transition-colors first:rounded-t-base last:rounded-b-base",
                  "hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-50",
                  isCurrent ? "bg-bg-brand-softer" : "",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <p
                    className={[
                      "text-sm font-medium",
                      isCurrent ? "text-text-fg-brand-strong" : "text-text-heading",
                    ].join(" ")}
                  >
                    {VIEW_MODE_LABELS[mode]}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{VIEW_MODE_DESCRIPTIONS[mode]}</p>
                </div>
                {isCurrent ? <Check className="mt-0.5 size-4 shrink-0 text-text-fg-brand-strong" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
