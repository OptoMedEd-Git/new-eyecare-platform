import type { CaseCustomHistoryCondition, CaseHistoryType, CaseLaterality } from "./types";

export type CustomHistoryFormEntry = {
  /** Stable key for React lists (DB id when editing, generated client-side when new). */
  clientId: string;
  conditionText: string;
  laterality: CaseLaterality | null;
};

export function emptyCustomHistoryEntries(): CustomHistoryFormEntry[] {
  return [];
}

export function customConditionsToFormEntries(
  rows: CaseCustomHistoryCondition[],
): CustomHistoryFormEntry[] {
  return rows
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((row) => ({
      clientId: row.id,
      conditionText: row.conditionText,
      laterality: row.laterality,
    }));
}

export function ocularCustomEntriesToPayload(entries: CustomHistoryFormEntry[]) {
  return entries
    .map((entry, index) => ({
      conditionText: entry.conditionText.trim(),
      laterality: entry.laterality,
      position: index,
    }))
    .filter((entry) => entry.conditionText.length > 0);
}

export function medicalCustomEntriesToPayload(entries: CustomHistoryFormEntry[]) {
  return entries
    .map((entry, index) => ({
      conditionText: entry.conditionText.trim(),
      position: index,
    }))
    .filter((entry) => entry.conditionText.length > 0);
}

export type CustomHistoryFormState = Record<CaseHistoryType, CustomHistoryFormEntry[]>;

export function emptyCustomHistoryFormState(): CustomHistoryFormState {
  return { ocular: [], medical: [] };
}

export function customHistoryGroupedToFormState(
  grouped: { ocular: CaseCustomHistoryCondition[]; medical: CaseCustomHistoryCondition[] },
): CustomHistoryFormState {
  return {
    ocular: customConditionsToFormEntries(grouped.ocular),
    medical: customConditionsToFormEntries(grouped.medical),
  };
}
