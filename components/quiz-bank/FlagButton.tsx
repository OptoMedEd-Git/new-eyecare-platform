"use client";

import { flagQuestion, unflagQuestion } from "@/app/(app)/quiz-bank/flag-actions";
import { Flag } from "lucide-react";
import { useState, useTransition } from "react";

type Props = {
  questionId: string;
  initialFlagged: boolean;
  variant?: "icon" | "icon-label";
  onToggle?: (nowFlagged: boolean) => void;
};

export function FlagButton({ questionId, initialFlagged, variant = "icon-label", onToggle }: Props) {
  const [flagged, setFlagged] = useState(initialFlagged);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const nextFlagged = !flagged;
    setFlagged(nextFlagged);

    startTransition(async () => {
      const result = nextFlagged ? await flagQuestion(questionId) : await unflagQuestion(questionId);

      if (!result.success) {
        setFlagged(!nextFlagged);
        return;
      }
      onToggle?.(nextFlagged);
    });
  }

  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-base text-sm font-medium transition-colors disabled:opacity-50";
  const activeClasses = flagged
    ? "bg-bg-warning-softer text-text-fg-warning-strong hover:bg-bg-warning-soft"
    : "border border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={flagged}
        aria-label={flagged ? "Remove flag" : "Flag for review"}
        title={flagged ? "Remove flag" : "Flag for review"}
        className={`${baseClasses} ${activeClasses} size-8 justify-center`}
      >
        <Flag className="size-4" fill={flagged ? "currentColor" : "none"} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={flagged}
      className={`${baseClasses} ${activeClasses} px-3 py-1.5`}
    >
      <Flag className="size-4" fill={flagged ? "currentColor" : "none"} aria-hidden />
      {flagged ? "Flagged" : "Flag for review"}
    </button>
  );
}
