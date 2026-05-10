"use client";

import type { LucideIcon } from "lucide-react";
import { ListChecks, XCircle } from "lucide-react";

export type ResultsFilter = "all" | "incorrect" | "flagged";

type Props = {
  value: ResultsFilter;
  onChange: (filter: ResultsFilter) => void;
  allCount: number;
  incorrectCount: number;
};

export function QuizResultsFilterToggle({ value, onChange, allCount, incorrectCount }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter questions by status"
      className="inline-flex items-center rounded-base border border-border-default bg-bg-primary-soft p-1"
    >
      <FilterButton
        active={value === "all"}
        onClick={() => onChange("all")}
        icon={ListChecks}
        label="All"
        count={allCount}
      />
      <FilterButton
        active={value === "incorrect"}
        onClick={() => onChange("incorrect")}
        icon={XCircle}
        label="Incorrect"
        count={incorrectCount}
      />
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-bg-brand-softer text-text-fg-brand-strong"
          : "text-text-body hover:bg-bg-secondary-soft",
      ].join(" ")}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
      <span className={active ? "text-text-fg-brand-strong" : "text-text-muted"}>({count})</span>
    </button>
  );
}
