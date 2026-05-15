"use client";

import type { FindingRowFormValue } from "@/lib/cases/findings-form";
import type { CaseFindingType, FindingRowCatalogEntry } from "@/lib/cases/types";

const cellInputClass =
  "w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-body shadow-xs outline-none transition-colors placeholder:text-text-muted focus:border-border-brand focus:ring-4 focus:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-50";

type Props = {
  findingType: CaseFindingType;
  title: string;
  subtitle: string;
  catalogRows: FindingRowCatalogEntry[];
  value: FindingRowFormValue[] | null;
  onChange: (next: FindingRowFormValue[] | null) => void;
  disabled?: boolean;
};

export function FindingsTable({
  findingType,
  title,
  subtitle,
  catalogRows,
  value,
  onChange,
  disabled = false,
}: Props) {
  const included = value !== null;
  const rowsForType = catalogRows
    .filter((r) => r.findingType === findingType)
    .sort((a, b) => a.position - b.position);

  function setIncluded(next: boolean) {
    if (!next) {
      onChange(null);
      return;
    }
    onChange(
      rowsForType.map((c) => {
        const existing = value?.find((r) => r.rowKey === c.rowKey);
        return {
          rowKey: c.rowKey,
          odValue: existing?.odValue ?? "",
          osValue: existing?.osValue ?? "",
        };
      }),
    );
  }

  function updateCell(rowKey: string, eye: "od" | "os", cellValue: string) {
    if (!value) return;
    onChange(
      value.map((row) =>
        row.rowKey === rowKey
          ? { ...row, [eye === "od" ? "odValue" : "osValue"]: cellValue }
          : row,
      ),
    );
  }

  function handleInsertNormals() {
    if (!value) return;
    const confirmed = window.confirm(
      "This will fill all OD/OS cells with default normal values, overwriting any existing values. Continue?",
    );
    if (!confirmed) return;

    const byKey = new Map(rowsForType.map((c) => [c.rowKey, c]));
    onChange(
      value.map((row) => {
        const cat = byKey.get(row.rowKey);
        return {
          ...row,
          odValue: cat?.defaultNormalOd ?? "",
          osValue: cat?.defaultNormalOs ?? "",
        };
      }),
    );
  }

  return (
    <section className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft">
      <div className="border-b border-border-default bg-bg-secondary-soft p-4">
        <h3 className="text-lg font-medium text-text-heading">{title}</h3>
        <p className="mt-1 text-base text-text-body">{subtitle}</p>
      </div>

      <FindingsToolbarRow
        included={included}
        disabled={disabled}
        onToggle={setIncluded}
        onInsertNormals={handleInsertNormals}
      />

      {included ? (
        <FindingsTableBody
          findingType={findingType}
          rowsForType={rowsForType}
          value={value}
          disabled={disabled}
          updateCell={updateCell}
        />
      ) : (
        <p className="px-4 py-6 text-sm text-text-body">
          This section is omitted from this case. Turn on &ldquo;Include in case&rdquo; to add this
          findings table.
        </p>
      )}
    </section>
  );
}

function FindingsToolbarRow({
  included,
  disabled,
  onToggle,
  onInsertNormals,
}: {
  included: boolean;
  disabled: boolean;
  onToggle: (next: boolean) => void;
  onInsertNormals: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border-default bg-bg-secondary-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-text-heading sm:order-2">
        <input
          type="checkbox"
          role="switch"
          aria-checked={included}
          checked={included}
          disabled={disabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="size-4 rounded border-border-default text-bg-brand focus:ring-ring-brand"
        />
        Include in case
      </label>
      {included ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onInsertNormals}
          className="inline-flex items-center justify-center rounded-base border border-border-default bg-bg-primary-soft px-3 py-1.5 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft disabled:opacity-50 sm:order-1"
        >
          Insert normal values
        </button>
      ) : null}
    </div>
  );
}

function FindingsTableBody({
  findingType,
  rowsForType,
  value,
  disabled,
  updateCell,
}: {
  findingType: CaseFindingType;
  rowsForType: FindingRowCatalogEntry[];
  value: FindingRowFormValue[] | null;
  disabled: boolean;
  updateCell: (rowKey: string, eye: "od" | "os", cellValue: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-default bg-bg-primary-soft">
            <th className="px-4 py-3 text-left font-medium text-text-muted" scope="col">
              Finding
            </th>
            <th className="w-40 px-4 py-3 text-left font-medium text-text-muted" scope="col">
              OD
            </th>
            <th className="w-40 px-4 py-3 text-left font-medium text-text-muted" scope="col">
              OS
            </th>
          </tr>
        </thead>
        <tbody>
          {rowsForType.map((catalog) => {
            const row = value?.find((r) => r.rowKey === catalog.rowKey);
            return (
              <tr key={catalog.rowKey} className="border-b border-border-default last:border-0">
                <td className="px-4 py-2 align-middle font-medium text-text-heading">
                  {catalog.rowLabel}
                </td>
                <td className="px-4 py-2 align-middle">
                  <input
                    type="text"
                    id={`${findingType}-${catalog.rowKey}-od`}
                    value={row?.odValue ?? ""}
                    disabled={disabled}
                    onChange={(e) => updateCell(catalog.rowKey, "od", e.target.value)}
                    placeholder="—"
                    className={cellInputClass}
                    aria-label={`${catalog.rowLabel} OD`}
                  />
                </td>
                <td className="px-4 py-2 align-middle">
                  <input
                    type="text"
                    id={`${findingType}-${catalog.rowKey}-os`}
                    value={row?.osValue ?? ""}
                    disabled={disabled}
                    onChange={(e) => updateCell(catalog.rowKey, "os", e.target.value)}
                    placeholder="—"
                    className={cellInputClass}
                    aria-label={`${catalog.rowLabel} OS`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
