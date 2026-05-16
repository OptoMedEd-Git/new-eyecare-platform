import { createClient } from "@/lib/supabase/server";
import { rowToQuizQuestion } from "@/lib/quiz-bank/queries";

import { CASE_FINDING_TYPES } from "./types";
import type {
  CaseAncillaryTest,
  CaseAncillaryTestMedia,
  CaseAttempt,
  CaseAttemptStatus,
  CaseAudience,
  CaseDifficulty,
  CaseFindingRow,
  CaseFindingType,
  CaseFindingsByType,
  CasePatientSex,
  CaseQuestionEntry,
  ClinicalCase,
  CaseLaterality,
  CaseMedicalHistorySelection,
  CaseOcularHistorySelection,
  CaseWithDetails,
  MedicalHistoryCondition,
  OcularHistoryCondition,
} from "./types";

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function rowToCase(row: Record<string, unknown>): ClinicalCase {
  const cat = single(row.category as { id: string; name: string } | { id: string; name: string }[] | null);
  if (!cat) {
    throw new Error("case row missing required category");
  }

  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    chiefComplaint: row.chief_complaint == null ? null : String(row.chief_complaint),
    hpi: row.hpi == null ? null : String(row.hpi),
    patientAge: row.patient_age == null ? null : Number(row.patient_age),
    patientSex: (row.patient_sex as CasePatientSex | null) ?? null,
    patientEthnicity: row.patient_ethnicity == null ? null : String(row.patient_ethnicity),
    pastOcularHistory: row.past_ocular_history == null ? null : String(row.past_ocular_history),
    pastMedicalHistory: row.past_medical_history == null ? null : String(row.past_medical_history),
    medications: row.medications == null ? null : String(row.medications),
    allergies: row.allergies == null ? null : String(row.allergies),
    category: { id: String(cat.id), name: String(cat.name) },
    difficulty: row.difficulty as CaseDifficulty,
    audience: row.target_audience as CaseAudience,
    status: row.status === "published" ? "published" : "draft",
    authorId: row.author_id == null ? null : String(row.author_id),
    learningObjectives: row.learning_objectives == null ? null : String(row.learning_objectives),
    publishedAt: row.published_at == null ? null : String(row.published_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function rowToCaseFindingRow(
  row: Record<string, unknown>,
  labelByKey?: Map<string, string>,
): CaseFindingRow {
  const findingType = row.finding_type as CaseFindingType;
  const rowKey = String(row.row_key);
  const label = labelByKey?.get(`${findingType}:${rowKey}`);
  return {
    id: String(row.id),
    caseId: String(row.case_id),
    findingType,
    rowKey,
    odValue: row.od_value == null ? null : String(row.od_value),
    osValue: row.os_value == null ? null : String(row.os_value),
    position: Number(row.position),
    rowLabel: label,
  };
}

export function emptyFindingsByType(): CaseFindingsByType {
  return CASE_FINDING_TYPES.reduce((acc, t) => {
    acc[t] = [];
    return acc;
  }, {} as CaseFindingsByType);
}

export function groupFindingsByType(rows: CaseFindingRow[]): CaseFindingsByType {
  const grouped = emptyFindingsByType();
  for (const row of rows) {
    grouped[row.findingType].push(row);
  }
  for (const t of CASE_FINDING_TYPES) {
    grouped[t].sort((a, b) => a.position - b.position);
  }
  return grouped;
}

function rowToAncillaryMedia(row: Record<string, unknown>): CaseAncillaryTestMedia {
  return {
    id: String(row.id),
    ancillaryTestId: String(row.ancillary_test_id),
    mediaUrl: String(row.media_url),
    caption: row.caption == null ? null : String(row.caption),
    position: Number(row.position),
  };
}

function rowToAncillaryTest(row: Record<string, unknown>): CaseAncillaryTest {
  const testTypeRaw = row.test_type;
  const testTypeRow = single(
    testTypeRaw as Record<string, unknown> | Record<string, unknown>[] | null,
  );
  const testType = testTypeRow
    ? {
        id: String(testTypeRow.id),
        name: String(testTypeRow.name),
        category: testTypeRow.category == null ? null : String(testTypeRow.category),
        position: Number(testTypeRow.position),
        isActive: Boolean(testTypeRow.is_active),
      }
    : null;

  const customName = row.custom_test_name == null ? null : String(row.custom_test_name);
  const displayName = testType?.name ?? customName ?? "Ancillary test";

  const mediaRaw = row.media;
  const mediaRows = (Array.isArray(mediaRaw) ? mediaRaw : mediaRaw ? [mediaRaw] : []) as Array<
    Record<string, unknown>
  >;

  return {
    id: String(row.id),
    caseId: String(row.case_id),
    testTypeId: row.test_type_id == null ? null : String(row.test_type_id),
    customTestName: customName,
    reliability: row.reliability == null ? null : String(row.reliability),
    odFindings: row.od_findings == null ? null : String(row.od_findings),
    osFindings: row.os_findings == null ? null : String(row.os_findings),
    notes: row.notes == null ? null : String(row.notes),
    position: Number(row.position),
    displayName,
    testType,
    media: mediaRows.map(rowToAncillaryMedia).sort((a, b) => a.position - b.position),
  };
}

export function rowToCaseAttempt(row: Record<string, unknown>): CaseAttempt {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    caseId: String(row.case_id),
    status: row.status as CaseAttemptStatus,
    startedAt: String(row.started_at),
    submittedAt: row.submitted_at == null ? null : String(row.submitted_at),
    scoreCorrect: row.score_correct == null ? null : Number(row.score_correct),
    scoreTotal: row.score_total == null ? null : Number(row.score_total),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

const CASE_SELECT = `
  *,
  category:blog_categories(id, name)
`;

/**
 * Published case by slug (public case-taking foundation).
 */
export async function getPublishedCaseBySlug(slug: string): Promise<ClinicalCase | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cases")
    .select(CASE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return rowToCase(data as Record<string, unknown>);
}

/**
 * Findings rows for a case, grouped by finding_type (ordered by position).
 */
async function getFindingRowLabelMap(): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finding_row_catalog")
    .select("finding_type, row_key, row_label");

  const map = new Map<string, string>();
  if (error || !data) return map;

  for (const row of data as Array<Record<string, unknown>>) {
    map.set(`${String(row.finding_type)}:${String(row.row_key)}`, String(row.row_label));
  }
  return map;
}

export async function getCaseFindingsGrouped(caseId: string): Promise<CaseFindingsByType> {
  const supabase = await createClient();

  const [labelMap, { data, error }] = await Promise.all([
    getFindingRowLabelMap(),
    supabase
      .from("case_findings_rows")
      .select("*")
      .eq("case_id", caseId)
      .order("position", { ascending: true }),
  ]);

  if (error || !data) return emptyFindingsByType();

  return groupFindingsByType(
    (data as Array<Record<string, unknown>>).map((row) => rowToCaseFindingRow(row, labelMap)),
  );
}

/**
 * Ancillary tests for a case with catalog join and nested media.
 */
export async function getCaseAncillaryTestsWithMedia(caseId: string): Promise<CaseAncillaryTest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("case_ancillary_tests")
    .select(
      `
      *,
      test_type:ancillary_test_types(id, name, category, position, is_active),
      media:case_ancillary_test_media(id, ancillary_test_id, media_url, caption, position)
    `,
    )
    .eq("case_id", caseId)
    .order("position", { ascending: true });

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map(rowToAncillaryTest);
}

/**
 * Ordered case questions with full `QuizQuestion` shape via `rowToQuizQuestion`.
 */
export async function getCaseQuestionsWithQuizQuestions(caseId: string): Promise<CaseQuestionEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("case_questions")
    .select(
      `
      id,
      case_id,
      question_id,
      position,
      question:quiz_questions(
        *,
        category:blog_categories(id, name),
        choices:quiz_question_choices(id, question_id, position, text, is_correct),
        true_false:quiz_question_true_false(question_id, correct_answer)
      )
    `,
    )
    .eq("case_id", caseId)
    .order("position", { ascending: true });

  if (error || !data) return [];

  const entries: CaseQuestionEntry[] = [];

  for (const item of data as Array<Record<string, unknown>>) {
    const qRaw = item.question;
    const questionRow = single(qRaw as Record<string, unknown> | Record<string, unknown>[] | null);
    if (!questionRow) continue;

    const choicesRaw = questionRow.choices;
    const choiceRows = (
      Array.isArray(choicesRaw) ? choicesRaw : choicesRaw ? [choicesRaw] : []
    ) as Array<Record<string, unknown>>;

    entries.push({
      id: String(item.id),
      caseId: String(item.case_id),
      questionId: String(item.question_id),
      position: Number(item.position),
      question: rowToQuizQuestion(questionRow, choiceRows),
    });
  }

  return entries;
}

export async function getOcularHistoryConditions(): Promise<OcularHistoryCondition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ocular_history_conditions")
    .select("*")
    .eq("is_active", true)
    .order("position");

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    hasLaterality: Boolean(row.has_laterality),
    position: Number(row.position),
  }));
}

export async function getMedicalHistoryConditions(): Promise<MedicalHistoryCondition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medical_history_conditions")
    .select("*")
    .eq("is_active", true)
    .order("position");

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    position: Number(row.position),
  }));
}

export async function getCaseOcularHistory(caseId: string): Promise<CaseOcularHistorySelection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_ocular_history")
    .select(
      `
      condition_id,
      laterality,
      condition:ocular_history_conditions(name)
    `,
    )
    .eq("case_id", caseId);

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map((row) => {
    const cond = single(
      row.condition as { name: string } | { name: string }[] | null,
    );
    return {
      conditionId: String(row.condition_id),
      conditionName: cond?.name,
      laterality: (row.laterality as CaseLaterality | null) ?? "OU",
    };
  });
}

export async function getCaseMedicalHistory(caseId: string): Promise<CaseMedicalHistorySelection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_medical_history")
    .select(
      `
      condition_id,
      condition:medical_history_conditions(name)
    `,
    )
    .eq("case_id", caseId);

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map((row) => {
    const cond = single(
      row.condition as { name: string } | { name: string }[] | null,
    );
    return {
      conditionId: String(row.condition_id),
      conditionName: cond?.name,
    };
  });
}

/**
 * Full published case payload for downstream case-taking UI.
 */
export async function getPublishedCaseWithDetails(slug: string): Promise<CaseWithDetails | null> {
  const clinicalCase = await getPublishedCaseBySlug(slug);
  if (!clinicalCase) return null;

  const [findingsByType, ancillaryTests, questions, ocularHistory, medicalHistory] =
    await Promise.all([
      getCaseFindingsGrouped(clinicalCase.id),
      getCaseAncillaryTestsWithMedia(clinicalCase.id),
      getCaseQuestionsWithQuizQuestions(clinicalCase.id),
      getCaseOcularHistory(clinicalCase.id),
      getCaseMedicalHistory(clinicalCase.id),
    ]);

  return {
    ...clinicalCase,
    findingsByType,
    ancillaryTests,
    questions,
    ocularHistory,
    medicalHistory,
  };
}
