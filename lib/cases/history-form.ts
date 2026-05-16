import type {
  CaseLaterality,
  CaseMedicalHistorySelection,
  CaseOcularHistorySelection,
  MedicalHistoryCondition,
  OcularHistoryCondition,
} from "./types";

export type OcularConditionFormRow = {
  conditionId: string;
  checked: boolean;
  laterality: CaseLaterality;
};

export type MedicalConditionFormRow = {
  conditionId: string;
  checked: boolean;
};

export function emptyOcularFormRows(catalog: OcularHistoryCondition[]): OcularConditionFormRow[] {
  return catalog.map((c) => ({
    conditionId: c.id,
    checked: false,
    laterality: "OU",
  }));
}

export function emptyMedicalFormRows(catalog: MedicalHistoryCondition[]): MedicalConditionFormRow[] {
  return catalog.map((c) => ({
    conditionId: c.id,
    checked: false,
  }));
}

export function ocularSelectionsToFormRows(
  catalog: OcularHistoryCondition[],
  selections: CaseOcularHistorySelection[],
): OcularConditionFormRow[] {
  const byId = new Map(selections.map((s) => [s.conditionId, s]));
  return catalog.map((c) => {
    const sel = byId.get(c.id);
    return {
      conditionId: c.id,
      checked: Boolean(sel),
      laterality: sel?.laterality ?? "OU",
    };
  });
}

export function medicalSelectionsToFormRows(
  catalog: MedicalHistoryCondition[],
  selections: CaseMedicalHistorySelection[],
): MedicalConditionFormRow[] {
  const selected = new Set(selections.map((s) => s.conditionId));
  return catalog.map((c) => ({
    conditionId: c.id,
    checked: selected.has(c.id),
  }));
}

export function ocularFormRowsToPayload(rows: OcularConditionFormRow[]) {
  return rows
    .filter((r) => r.checked)
    .map((r) => ({
      conditionId: r.conditionId,
      laterality: r.laterality,
    }));
}

export function medicalFormRowsToPayload(rows: MedicalConditionFormRow[]) {
  return rows.filter((r) => r.checked).map((r) => ({ conditionId: r.conditionId }));
}
