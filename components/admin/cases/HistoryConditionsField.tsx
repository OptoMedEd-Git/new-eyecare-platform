"use client";

import type { ReactNode } from "react";

import { CASE_LATERALITY_OPTIONS } from "@/lib/cases/constants";
import type {
  MedicalConditionFormRow,
  OcularConditionFormRow,
} from "@/lib/cases/history-form";
import type { CaseLaterality, MedicalHistoryCondition, OcularHistoryCondition } from "@/lib/cases/types";

/** Mirrors quiz-bank choice checkboxes (`QuestionForm` multi-select). */
const checkboxClass =
  "size-4 shrink-0 rounded border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "text-sm font-medium leading-5 text-text-body";

type OcularProps = {
  variant: "ocular";
  catalog: OcularHistoryCondition[];
  rows: OcularConditionFormRow[];
  onChange: (rows: OcularConditionFormRow[]) => void;
  disabled?: boolean;
  otherSlot?: ReactNode;
};

type MedicalProps = {
  variant: "medical";
  catalog: MedicalHistoryCondition[];
  rows: MedicalConditionFormRow[];
  onChange: (rows: MedicalConditionFormRow[]) => void;
  disabled?: boolean;
  otherSlot?: ReactNode;
};

type Props = OcularProps | MedicalProps;

function splitIntoColumns<T>(items: T[]): [T[], T[]] {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
}

export function HistoryConditionsField(props: Props) {
  if (props.variant === "ocular") {
    return <OcularHistoryConditionsList {...props} />;
  }
  return <MedicalHistoryConditionsList {...props} />;
}

function OcularHistoryConditionsList({
  catalog,
  rows,
  onChange,
  disabled = false,
  otherSlot,
}: OcularProps) {
  const sortedCatalog = [...catalog].sort((a, b) => a.position - b.position);
  const [leftColumn, rightColumn] = splitIntoColumns(sortedCatalog);

  if (sortedCatalog.length === 0) {
    return (
      <p className="text-sm text-text-muted">No conditions are configured in the catalog yet.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft">
      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-border-default">
        <ConditionColumn>
          {leftColumn.map((condition) => (
            <OcularConditionRow
              key={condition.id}
              condition={condition}
              row={rows.find((r) => r.conditionId === condition.id)}
              rows={rows}
              disabled={disabled}
              onChange={onChange}
            />
          ))}
        </ConditionColumn>
        <div className="flex min-w-0 flex-col">
          <ConditionColumn className="flex-1">
            {rightColumn.map((condition) => (
              <OcularConditionRow
                key={condition.id}
                condition={condition}
                row={rows.find((r) => r.conditionId === condition.id)}
                rows={rows}
                disabled={disabled}
                onChange={onChange}
              />
            ))}
          </ConditionColumn>
          {otherSlot ? (
            <div className="border-t border-border-default px-4 py-4 md:border-t-0 md:border-l-0">
              {otherSlot}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MedicalHistoryConditionsList({
  catalog,
  rows,
  onChange,
  disabled = false,
  otherSlot,
}: MedicalProps) {
  const sortedCatalog = [...catalog].sort((a, b) => a.position - b.position);
  const [leftColumn, rightColumn] = splitIntoColumns(sortedCatalog);

  if (sortedCatalog.length === 0) {
    return (
      <p className="text-sm text-text-muted">No conditions are configured in the catalog yet.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft">
      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-border-default">
        <ConditionColumn>
          {leftColumn.map((condition) => (
            <MedicalConditionRow
              key={condition.id}
              condition={condition}
              row={rows.find((r) => r.conditionId === condition.id)}
              rows={rows}
              disabled={disabled}
              onChange={onChange}
            />
          ))}
        </ConditionColumn>
        <div className="flex min-w-0 flex-col">
          <ConditionColumn className="flex-1">
            {rightColumn.map((condition) => (
              <MedicalConditionRow
                key={condition.id}
                condition={condition}
                row={rows.find((r) => r.conditionId === condition.id)}
                rows={rows}
                disabled={disabled}
                onChange={onChange}
              />
            ))}
          </ConditionColumn>
          {otherSlot ? (
            <div className="border-t border-border-default px-4 py-4">{otherSlot}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ConditionColumn({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ul className={`divide-y divide-border-default ${className}`.trim()}>{children}</ul>;
}

function OcularConditionRow({
  condition,
  row,
  rows,
  disabled,
  onChange,
}: {
  condition: OcularHistoryCondition;
  row: OcularConditionFormRow | undefined;
  rows: OcularConditionFormRow[];
  disabled: boolean;
  onChange: (rows: OcularConditionFormRow[]) => void;
}) {
  const resolved =
    row ??
    ({
      conditionId: condition.id,
      checked: false,
      laterality: "OU",
    } satisfies OcularConditionFormRow);

  const lateralityDisabled = disabled || !resolved.checked;

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-2">
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className={checkboxClass}
            checked={resolved.checked}
            disabled={disabled}
            onChange={(e) => {
              const checked = e.target.checked;
              onChange(
                rows.map((r) =>
                  r.conditionId === condition.id
                    ? { ...r, checked, laterality: checked ? r.laterality || "OU" : r.laterality }
                    : r,
                ),
              );
            }}
          />
          <span className={`min-w-0 flex-1 ${labelClass}`}>{condition.name}</span>
        </label>
        {condition.hasLaterality ? (
          <LateralitySegmentedControl
            value={resolved.laterality}
            disabled={lateralityDisabled}
            onLateralityChange={(laterality) => {
              onChange(
                rows.map((r) =>
                  r.conditionId === condition.id ? { ...r, laterality } : r,
                ),
              );
            }}
          />
        ) : null}
      </div>
    </li>
  );
}

function MedicalConditionRow({
  condition,
  row,
  rows,
  disabled,
  onChange,
}: {
  condition: MedicalHistoryCondition;
  row: MedicalConditionFormRow | undefined;
  rows: MedicalConditionFormRow[];
  disabled: boolean;
  onChange: (rows: MedicalConditionFormRow[]) => void;
}) {
  const resolved =
    row ??
    ({
      conditionId: condition.id,
      checked: false,
    } satisfies MedicalConditionFormRow);

  return (
    <li className="px-4 py-3">
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          className={checkboxClass}
          checked={resolved.checked}
          disabled={disabled}
          onChange={(e) => {
            const checked = e.target.checked;
            onChange(
              rows.map((r) =>
                r.conditionId === condition.id ? { ...r, checked } : r,
              ),
            );
          }}
        />
        <span className={labelClass}>{condition.name}</span>
      </label>
    </li>
  );
}

/**
 * Segmented laterality control — same values as the prior `<select>` (`CASE_LATERALITY_OPTIONS`).
 */
function LateralitySegmentedControl({
  value,
  disabled,
  onLateralityChange,
}: {
  value: CaseLaterality;
  disabled: boolean;
  onLateralityChange: (laterality: CaseLaterality) => void;
}) {
  const options = CASE_LATERALITY_OPTIONS;
  const lastIndex = options.length - 1;

  return (
    <div
      role="radiogroup"
      aria-label="Laterality"
      className={[
        "inline-flex shrink-0",
        disabled ? "pointer-events-none opacity-50" : "",
      ].join(" ")}
    >
      {options.map((opt, index) => {
        const isSelected = value === opt.value;
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
