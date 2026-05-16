"use client";

import { CaseLateralitySegmented } from "@/components/admin/cases/CaseLateralitySegmented";
import type {
  MedicalConditionFormRow,
  OcularConditionFormRow,
} from "@/lib/cases/history-form";
import type { MedicalHistoryCondition, OcularHistoryCondition } from "@/lib/cases/types";

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
    <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft">
      <ul className="divide-y divide-border-default">
        {sortedCatalog.map((condition) => (
          <OcularConditionRow
            key={condition.id}
            condition={condition}
            row={rows.find((r) => r.conditionId === condition.id)}
            rows={rows}
            disabled={disabled}
            onChange={onChange}
          />
        ))}
      </ul>
    </div>
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
    <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft">
      <ul className="divide-y divide-border-default">
        {sortedCatalog.map((condition) => (
          <MedicalConditionRow
            key={condition.id}
            condition={condition}
            row={rows.find((r) => r.conditionId === condition.id)}
            rows={rows}
            disabled={disabled}
            onChange={onChange}
          />
        ))}
      </ul>
    </div>
  );
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
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
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
          <CaseLateralitySegmented
            value={resolved.laterality}
            disabled={lateralityDisabled}
            required
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
