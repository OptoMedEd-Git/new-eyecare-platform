import type { CasePatientSex } from "./types";

const TITLE_MAX_LENGTH = 80;
const MISSING_COMPLAINT = "[Add chief complaint]";

function sexWord(sex: CasePatientSex | null | undefined): string | null {
  if (!sex || sex === "Unspecified") return "patient";
  if (sex === "M") return "male";
  if (sex === "F") return "female";
  return "patient";
}

function truncateAtWordBoundary(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.5) {
    return `${slice.slice(0, lastSpace).trimEnd()}…`;
  }
  return `${slice.trimEnd()}…`;
}

export type ComposeCaseTitleInput = {
  patientAge: number | null | undefined;
  patientSex: CasePatientSex | null | undefined;
  chiefComplaint: string | null | undefined;
};

/**
 * Builds `{age}yo {sex} with {chief_complaint}` per locked product rules.
 */
export function composeCaseTitle(input: ComposeCaseTitleInput): string {
  const age =
    input.patientAge != null && Number.isFinite(input.patientAge) ? Math.trunc(input.patientAge) : null;
  const sex = sexWord(input.patientSex);
  const complaintRaw = input.chiefComplaint?.trim();
  const complaint = complaintRaw && complaintRaw.length > 0 ? complaintRaw : MISSING_COMPLAINT;

  let title: string;

  if (age != null && sex) {
    title = `${age}yo ${sex} with ${complaint}`;
  } else if (age != null) {
    title = `${age}yo patient with ${complaint}`;
  } else if (input.patientSex === "F") {
    title = `Female with ${complaint}`;
  } else if (input.patientSex === "M") {
    title = `Male with ${complaint}`;
  } else if (input.patientSex === "Other") {
    title = `Patient with ${complaint}`;
  } else {
    title = `Patient with ${complaint}`;
  }

  return truncateAtWordBoundary(title, TITLE_MAX_LENGTH);
}
