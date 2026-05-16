"use client";

import { CustomHistoryConditionsList } from "@/components/admin/cases/CustomHistoryConditionsList";
import { HistoryConditionsField } from "@/components/admin/cases/HistoryConditionsField";
import type { CustomHistoryFormEntry } from "@/lib/cases/custom-history-form";
import type {
  MedicalConditionFormRow,
  OcularConditionFormRow,
} from "@/lib/cases/history-form";
import type {
  CaseHistoryType,
  MedicalHistoryCondition,
  OcularHistoryCondition,
} from "@/lib/cases/types";

type OcularSectionProps = {
  variant: "ocular";
  catalog: OcularHistoryCondition[];
  rows: OcularConditionFormRow[];
  onCatalogChange: (rows: OcularConditionFormRow[]) => void;
  customEntries: CustomHistoryFormEntry[];
  onCustomChange: (entries: CustomHistoryFormEntry[]) => void;
  disabled?: boolean;
};

type MedicalSectionProps = {
  variant: "medical";
  catalog: MedicalHistoryCondition[];
  rows: MedicalConditionFormRow[];
  onCatalogChange: (rows: MedicalConditionFormRow[]) => void;
  customEntries: CustomHistoryFormEntry[];
  onCustomChange: (entries: CustomHistoryFormEntry[]) => void;
  disabled?: boolean;
};

type Props = OcularSectionProps | MedicalSectionProps;

export function HistoryConditionsSection(props: Props) {
  const historyType: CaseHistoryType = props.variant;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {props.variant === "ocular" ? (
        <HistoryConditionsField
          variant="ocular"
          catalog={props.catalog}
          rows={props.rows}
          disabled={props.disabled}
          onChange={props.onCatalogChange}
        />
      ) : (
        <HistoryConditionsField
          variant="medical"
          catalog={props.catalog}
          rows={props.rows}
          disabled={props.disabled}
          onChange={props.onCatalogChange}
        />
      )}
      <CustomHistoryConditionsList
        historyType={historyType}
        entries={props.customEntries}
        onChange={props.onCustomChange}
        disabled={props.disabled}
      />
    </div>
  );
}
