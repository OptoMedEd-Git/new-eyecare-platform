"use client";

import { Flag } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

export type FlagActionResult = { success: true } | { success: false; error?: string };

type Props = {
  initialFlagged: boolean;
  variant?: "icon" | "icon-label";
  onToggle?: (nowFlagged: boolean) => void;
  flag: () => Promise<FlagActionResult>;
  unflag: () => Promise<FlagActionResult>;
};

export function FlagButton({ initialFlagged, variant = "icon-label", onToggle, flag, unflag }: Props) {
  const [flagged, setFlagged] = useState(initialFlagged);
  const [isPending, startTransition] = useTransition();
  const [showFlaggedToast, setShowFlaggedToast] = useState(false);

  useEffect(() => {
    if (!showFlaggedToast) return;
    const t = setTimeout(() => setShowFlaggedToast(false), 1500);
    return () => clearTimeout(t);
  }, [showFlaggedToast]);

  function handleToggle() {
    const nextFlagged = !flagged;
    setFlagged(nextFlagged);

    if (nextFlagged) {
      setShowFlaggedToast(true);
    } else {
      setShowFlaggedToast(false);
    }

    startTransition(async () => {
      const result = nextFlagged ? await flag() : await unflag();

      if (!result.success) {
        setFlagged(!nextFlagged);
        if (nextFlagged) setShowFlaggedToast(false);
        return;
      }
      onToggle?.(nextFlagged);
    });
  }

  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-base text-sm font-medium transition-colors disabled:opacity-50";
  const flaggedClasses = flagged
    ? "bg-bg-brand-softer text-text-fg-brand-strong hover:bg-bg-brand-soft"
    : "border border-border-default bg-bg-primary-soft text-text-muted hover:bg-bg-secondary-soft hover:text-text-heading";

  const buttonContent =
    variant === "icon" ? (
      <Flag className="size-4" fill={flagged ? "currentColor" : "none"} aria-hidden />
    ) : (
      <>
        <Flag className="size-4" fill={flagged ? "currentColor" : "none"} aria-hidden />
        {flagged ? "Flagged" : "Flag for review"}
      </>
    );

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={flagged}
        aria-label={variant === "icon" ? (flagged ? "Remove flag" : "Flag for review") : undefined}
        title={variant === "icon" ? (flagged ? "Remove flag" : "Flag for review") : undefined}
        className={[baseClasses, flaggedClasses, variant === "icon" ? "size-8 justify-center" : "px-3 py-1.5"].join(
          " ",
        )}
      >
        {buttonContent}
      </button>

      <span
        aria-hidden={!showFlaggedToast}
        className={[
          "pointer-events-none absolute whitespace-nowrap rounded-base bg-bg-brand px-2 py-1 text-xs font-medium text-text-on-brand shadow-sm",
          "transition-opacity duration-300",
          showFlaggedToast ? "opacity-100" : "opacity-0",
          "max-sm:left-1/2 max-sm:right-auto max-sm:top-full max-sm:mt-2 max-sm:-translate-x-1/2 max-sm:translate-y-0",
          "sm:right-full sm:top-1/2 sm:mr-2 sm:-translate-y-1/2 sm:left-auto sm:translate-x-0",
        ].join(" ")}
      >
        Flagged!
      </span>
    </div>
  );
}
