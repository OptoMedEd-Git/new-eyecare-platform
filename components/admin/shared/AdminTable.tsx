"use client";

import type { ReactNode } from "react";

/**
 * Declarative column for admin data tables. Callers own cell content and business logic;
 * AdminTable owns shared geometry: wrapper overflow, table-fixed + optional min-width,
 * thead/tbody structure, row chrome, and consistent cell padding.
 */
export type AdminTableColumnAlign = "left" | "right" | "center";

const ALIGN_TH: Record<AdminTableColumnAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

const ALIGN_TD: Record<AdminTableColumnAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export type AdminTableColumn<T> = {
  id: string;
  header: ReactNode;
  /** Applied to both th and td (e.g. w-32) — omit for the flexible “remainder” column */
  widthClass?: string;
  align?: AdminTableColumnAlign;
  /** Extra classes on th (e.g. overflow-hidden) */
  thClassName?: string;
  /** Extra classes on td */
  tdClassName?: string | ((row: T) => string);
  cell: (args: { row: T; rowIndex: number }) => ReactNode;
};

export type AdminTableLayoutOptions = {
  /**
   * When many columns use explicit w-*, the table needs a floor width so the flexible
   * column is not squeezed to zero under table-fixed (quiz-bank lesson). Arbitrary Tailwind
   * min-width class, e.g. min-w-[1128px].
   */
  tableMinWidthClass?: string;
  /**
   * `x-auto`: horizontal scroll in narrow layouts (recommended for wide fixed-column tables).
   * `hidden`: legacy clip — use only when matching an existing table pixel-for-pixel.
   */
  wrapperOverflow?: "x-auto" | "hidden";
};

export type AdminTableProps<T> = {
  rows: T[];
  getRowKey: (row: T) => string;
  columns: AdminTableColumn<T>[];
  layout?: AdminTableLayoutOptions;
};

export function AdminTable<T>({ rows, getRowKey, columns, layout }: AdminTableProps<T>) {
  if (rows.length === 0) return null;

  const wrapperOverflow = layout?.wrapperOverflow ?? "x-auto";
  const wrapperOverflowClass = wrapperOverflow === "hidden" ? "overflow-hidden" : "overflow-x-auto";

  const tableClassName = ["w-full", "table-fixed", layout?.tableMinWidthClass].filter(Boolean).join(" ");

  return (
    <div
      className={`${wrapperOverflowClass} rounded-base border border-border-default bg-bg-primary-soft shadow-xs`}
    >
      <table className={tableClassName}>
        <thead className="bg-bg-secondary-soft">
          <tr className="border-b border-border-default">
            {columns.map((col) => {
              const align: AdminTableColumnAlign = col.align ?? "left";
              const thClassName = [
                col.widthClass,
                "px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-muted",
                ALIGN_TH[align],
                col.thClassName,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <th key={col.id} scope="col" className={thClassName}>
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const isLast = rowIndex === rows.length - 1;
            const rowClassName =
              "transition-colors hover:bg-bg-secondary-soft" + (isLast ? "" : " border-b border-border-default");

            return (
              <tr key={getRowKey(row)} className={rowClassName}>
                {columns.map((col) => {
                  const align: AdminTableColumnAlign = col.align ?? "left";
                  const tdExtra =
                    typeof col.tdClassName === "function" ? col.tdClassName(row) : (col.tdClassName ?? "");
                  const tdClassName = [col.widthClass, "px-6 py-4", ALIGN_TD[align], tdExtra]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <td key={col.id} className={tdClassName}>
                      {col.cell({ row, rowIndex })}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
