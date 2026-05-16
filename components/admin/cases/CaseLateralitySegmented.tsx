"use client";

import { CASE_LATERALITY_OPTIONS } from "@/lib/cases/constants";
import type { CaseLaterality } from "@/lib/cases/types";

type Props = {
  value: CaseLaterality | null;
  disabled?: boolean;
  onLateralityChange: (laterality: CaseLaterality) => void;
  /** When true, one segment must always be selected (catalog ocular). */
  required?: boolean;
  ariaLabel?: string;
};

/**
 * Segmented laterality control — OD | OS | OU | None.
 * Catalog rows pass `required` with a default OU; custom entries use nullable value (no default).
 */
export function CaseLateralitySegmented({
  value,
  disabled = false,
  onLateralityChange,
  required = false,
  ariaLabel = "Laterality",
}: Props) {
  const options = CASE_LATERALITY_OPTIONS;
  const lastIndex = options.length - 1;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={[
        "inline-flex shrink-0",
        disabled ? "pointer-events-none opacity-50" : "",
      ].join(" ")}
    >
      {options.map((opt, index) => {
        const isSelected = required ? value === opt.value : value === opt.value;
        const isFirst = index === 0;
        const isLast = index === lastIndex;

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onLateralityChange(opt.value)}
            className={[
              "border border-border-default px-3 py-2 text-sm font-medium transition-colors",
              !isLast ? "-mr-px" : "",
              isFirst ? "rounded-l-base" : "",
              isLast ? "rounded-r-base" : "",
              isSelected
                ? "relative z-10 bg-bg-secondary-medium text-text-fg-brand-strong"
                : "bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
