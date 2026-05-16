"use client";

import { CASE_LATERALITY_OPTIONS } from "@/lib/cases/constants";
import type {
  MedicalConditionFormRow,
  OcularConditionFormRow,
} from "@/lib/cases/history-form";
import type { MedicalHistoryCondition, OcularHistoryCondition } from "@/lib/cases/types";

const checkboxClass =
  "size-4 shrink-0 rounded border-border-default text-bg-brand focus:ring-4 focus:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-50";

const selectClass =
  "rounded-base border border-border-default bg-bg-primary-soft px-2.5 py-1.5 text-sm text-text-body shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-50";

type OcularProps = {
  variant: "ocular";
  catalog: OcularHistoryCondition[];
  rows: OcularConditionFormRow[];
  onChange: (rows: OcularConditionFormRow[]) => void;
  disabled?: boolean;
};

type MedicalProps = {
  variant: "medical";
  catalog: MedicalHistoryCondition[];
  rows: MedicalConditionFormRow[];
  onChange: (rows: MedicalConditionFormRow[]) => void;
  disabled?: boolean;
};

type Props = OcularProps | MedicalProps;

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
}: OcularProps) {
  const sortedCatalog = [...catalog].sort((a, b) => a.position - b.position);

  if (sortedCatalog.length === 0) {
    return (
      <p className="text-sm text-text-muted">No conditions are configured in the catalog yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-border-default rounded-base border border-border-default bg-bg-primary-soft">
      {sortedCatalog.map((condition) => {
        const row = rows.find((r) => r.conditionId === condition.id) ?? {
          conditionId: condition.id,
          checked: false,
          laterality: "OU" as const,
        };

        return (
          <li
            key={condition.id}
            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={row.checked}
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
              <span className="text-sm text-text-body">{condition.name}</span>
            </label>
            {condition.hasLaterality ? (
              <LateralitySelect
                row={row}
                disabled={disabled || !row.checked}
                onLateralityChange={(laterality) => {
                  onChange(
                    rows.map((r) =>
                      r.conditionId === condition.id ? { ...r, laterality } : r,
                    ),
                  );
                }}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function MedicalHistoryConditionsList({
  catalog,
  rows,
  onChange,
  disabled = false,
}: MedicalProps) {
  const sortedCatalog = [...catalog].sort((a, b) => a.position - b.position);

  if (sortedCatalog.length === 0) {
    return (
      <p className="text-sm text-text-muted">No conditions are configured in the catalog yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-border-default rounded-base border border-border-default bg-bg-primary-soft">
      {sortedCatalog.map((condition) => {
        const row = rows.find((r) => r.conditionId === condition.id) ?? {
          conditionId: condition.id,
          checked: false,
        };

        return (
          <li key={condition.id} className="px-4 py-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={row.checked}
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
              <span className="text-sm text-text-body">{condition.name}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function LateralitySelect({
  row,
  disabled,
  onLateralityChange,
}: {
  row: OcularConditionFormRow;
  disabled: boolean;
  onLateralityChange: (laterality: OcularConditionFormRow["laterality"]) => void;
}) {
  return (
    <div className="flex items-center gap-2 sm:shrink-0">
      <span className="text-xs font-medium text-text-muted">Laterality</span>
      <select
        className={selectClass}
        value={row.laterality}
        disabled={disabled}
        aria-label={`Laterality for selected condition`}
        onChange={(e) =>
          onLateralityChange(e.target.value as OcularConditionFormRow["laterality"])
        }
      >
        {CASE_LATERALITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
