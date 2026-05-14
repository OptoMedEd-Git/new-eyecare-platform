"use client";

import { Filter, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

export type PracticeCategoryOption = { id: string; name: string; count: number };

type Props = {
  categoryOptions: PracticeCategoryOption[];
  selectedCategoryIds: string[];
  onCategoriesChange: (ids: string[]) => void;
  selectedAudiences: string[];
  onAudiencesChange: (audiences: string[]) => void;
  selectedDifficulties: string[];
  onDifficultiesChange: (difficulties: string[]) => void;
  /** Optional block rendered after core filters (e.g. flashcard “Only flagged”). */
  targetedSection?: ReactNode;
  /** Adds to the “N active” badge for filters not represented as chips (e.g. only flagged). */
  supplementalActiveCount?: number;
  /** Called after category/audience/difficulty clear (e.g. reset flashcard-only toggles). */
  onAfterClearAll?: () => void;
};

const AUDIENCES = [
  { value: "student", label: "Student" },
  { value: "resident", label: "Resident" },
  { value: "practicing", label: "Practicing" },
  { value: "all", label: "All clinicians" },
];

const DIFFICULTIES = [
  { value: "foundational", label: "Foundational" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function PracticeFilters({
  categoryOptions,
  selectedCategoryIds,
  onCategoriesChange,
  selectedAudiences,
  onAudiencesChange,
  selectedDifficulties,
  onDifficultiesChange,
  targetedSection,
  supplementalActiveCount = 0,
  onAfterClearAll,
}: Props) {
  const [open, setOpen] = useState(false);

  const totalActive =
    selectedCategoryIds.length +
    selectedAudiences.length +
    selectedDifficulties.length +
    supplementalActiveCount;

  function toggle<T extends string>(arr: T[], value: T, setter: (v: T[]) => void) {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  function clearAll() {
    onCategoriesChange([]);
    onAudiencesChange([]);
    onDifficultiesChange([]);
    onAfterClearAll?.();
  }

  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-text-heading"
      >
        <span className="inline-flex items-center gap-2">
          <Filter className="size-4 text-text-muted" aria-hidden />
          Filters
          {totalActive > 0 ? (
            <span className="inline-flex items-center justify-center rounded-full bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {totalActive} active
            </span>
          ) : null}
        </span>
        <span className="text-xs text-text-muted">{open ? "Hide" : "Show"}</span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-border-default p-4">
          {categoryOptions.length > 0 ? (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Category</h4>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((opt) => {
                  const selected = selectedCategoryIds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggle(selectedCategoryIds, opt.id, onCategoriesChange)}
                      className={[
                        "inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                        selected
                          ? "border-border-brand-subtle bg-bg-brand-softer text-text-fg-brand-strong"
                          : "border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft",
                      ].join(" ")}
                    >
                      {opt.name}
                      <span className="text-text-muted">({opt.count})</span>
                      {selected ? <X className="size-3" aria-hidden /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Audience</h4>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((opt) => {
                const selected = selectedAudiences.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(selectedAudiences, opt.value, onAudiencesChange)}
                    className={[
                      "inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                      selected
                        ? "border-border-brand-subtle bg-bg-brand-softer text-text-fg-brand-strong"
                        : "border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft",
                    ].join(" ")}
                  >
                    {opt.label}
                    {selected ? <X className="size-3" aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Difficulty</h4>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((opt) => {
                const selected = selectedDifficulties.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(selectedDifficulties, opt.value, onDifficultiesChange)}
                    className={[
                      "inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                      selected
                        ? "border-border-brand-subtle bg-bg-brand-softer text-text-fg-brand-strong"
                        : "border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft",
                    ].join(" ")}
                  >
                    {opt.label}
                    {selected ? <X className="size-3" aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          {targetedSection ? (
            <section className="mt-4 border-t border-border-default pt-4">
              <h3 className="mb-2 text-sm font-semibold text-text-heading">Targeted practice</h3>
              {targetedSection}
            </section>
          ) : null}

          {totalActive > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-text-fg-brand-strong hover:underline"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
