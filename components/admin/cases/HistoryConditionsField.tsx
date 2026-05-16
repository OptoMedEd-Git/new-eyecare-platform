"use client";

import type { ReactNode } from "react";

import { CASE_LATERALITY_OPTIONS } from "@/lib/cases/constants";
import type {
  MedicalConditionFormRow,
  OcularConditionFormRow,
} from "@/lib/cases/history-form";
import type { MedicalHistoryCondition, OcularHistoryCondition } from "@/lib/cases/types";

const checkboxClass =
  "mt-0.5 size-4 shrink-0 rounded border-border-default text-bg-brand focus:ring-4 focus:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-50";

const selectClass =
  "w-full max-w-[7.5rem] rounded-base border border-border-default bg-bg-primary-soft px-2 py-1.5 text-sm text-text-body shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-50";

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

  return (
    <li className="px-4 py-3">
      <label className="flex cursor-pointer items-start gap-2.5">
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
        <span className="min-w-0 flex-1 text-sm leading-snug text-text-body">{condition.name}</span>
      </label>
      {condition.hasLaterality ? (
        <div className="mt-2 pl-7">
          <LateralitySelect
            row={resolved}
            disabled={disabled || !resolved.checked}
            onLateralityChange={(laterality) => {
              onChange(
                rows.map((r) =>
                  r.conditionId === condition.id ? { ...r, laterality } : r,
                ),
              );
            }}
          />
        </div>
      ) : null}
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
      <label className="flex cursor-pointer items-start gap-2.5">
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
        <span className="min-w-0 flex-1 text-sm leading-snug text-text-body">{condition.name}</span>
      </label>
    </li>
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
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <span className="text-xs font-medium text-text-muted">Laterality</span>
      <select
        className={selectClass}
        value={row.laterality}
        disabled={disabled}
        aria-label="Laterality for selected condition"
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
