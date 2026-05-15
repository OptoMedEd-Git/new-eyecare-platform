import type { CaseFindingType, CaseFindingsByType, FindingRowCatalogEntry } from "./types";
import { CASE_FINDING_TYPES } from "./types";

export type FindingRowFormValue = {
  rowKey: string;
  odValue: string;
  osValue: string;
};

/** `null` = table omitted for this case; array = included (one entry per catalog row). */
export type FindingsFormState = Record<CaseFindingType, FindingRowFormValue[] | null>;

export function emptyFindingsFormState(): FindingsFormState {
  return CASE_FINDING_TYPES.reduce((acc, t) => {
    acc[t] = null;
    return acc;
  }, {} as FindingsFormState);
}

export function catalogRowsForType(
  catalog: FindingRowCatalogEntry[],
  findingType: CaseFindingType,
): FindingRowCatalogEntry[] {
  return catalog.filter((r) => r.findingType === findingType).sort((a, b) => a.position - b.position);
}

export function buildIncludedRowsFromCatalog(
  catalog: FindingRowCatalogEntry[],
  findingType: CaseFindingType,
  existing?: FindingRowFormValue[],
): FindingRowFormValue[] {
  const rows = catalogRowsForType(catalog, findingType);
  const byKey = new Map((existing ?? []).map((r) => [r.rowKey, r]));
  return rows.map((c) => {
    const prev = byKey.get(c.rowKey);
    return {
      rowKey: c.rowKey,
      odValue: prev?.odValue ?? "",
      osValue: prev?.osValue ?? "",
    };
  });
}

export function findingsByTypeToFormState(
  findingsByType: CaseFindingsByType,
  catalog: FindingRowCatalogEntry[],
): FindingsFormState {
  const state = emptyFindingsFormState();
  for (const findingType of CASE_FINDING_TYPES) {
    const dbRows = findingsByType[findingType];
    if (dbRows.length === 0) {
      state[findingType] = null;
      continue;
    }
    const existing: FindingRowFormValue[] = dbRows.map((r) => ({
      rowKey: r.rowKey,
      odValue: r.odValue ?? "",
      osValue: r.osValue ?? "",
    }));
    state[findingType] = buildIncludedRowsFromCatalog(catalog, findingType, existing);
  }
  return state;
}

export function applyCatalogNormals(
  rows: FindingRowFormValue[],
  catalog: FindingRowCatalogEntry[],
  findingType: CaseFindingType,
): FindingRowFormValue[] {
  const byKey = new Map(
    catalogRowsForType(catalog, findingType).map((c) => [c.rowKey, c]),
  );
  return rows.map((row) => {
    const cat = byKey.get(row.rowKey);
    return {
      ...row,
      odValue: cat?.defaultNormalOd ?? "",
      osValue: cat?.defaultNormalOs ?? "",
    };
  });
}
