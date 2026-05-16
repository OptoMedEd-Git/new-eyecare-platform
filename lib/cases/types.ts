import type { QuestionAudience, QuizDifficulty, QuizQuestion } from "@/lib/quiz-bank/types";

/** Reuses `quiz_difficulty` enum from the quiz bank. */
export type CaseDifficulty = QuizDifficulty;

/** Reuses `target_audience` check constraint values (column name on `cases`). */
export type CaseAudience = QuestionAudience;

export type CaseStatus = "draft" | "published";

export type CaseFindingType =
  | "vision_refraction"
  | "preliminary"
  | "anterior_segment"
  | "posterior_segment";

export const CASE_FINDING_TYPES: CaseFindingType[] = [
  "vision_refraction",
  "preliminary",
  "anterior_segment",
  "posterior_segment",
];

export type CasePatientSex = "M" | "F" | "Other" | "Unspecified";

export type CaseLaterality = "OD" | "OS" | "OU" | "none";

export type CaseAttemptStatus = "in_progress" | "submitted" | "abandoned";

export type OcularHistoryCondition = {
  id: string;
  name: string;
  hasLaterality: boolean;
  position: number;
};

export type MedicalHistoryCondition = {
  id: string;
  name: string;
  position: number;
};

export type CaseOcularHistorySelection = {
  conditionId: string;
  conditionName?: string;
  laterality: CaseLaterality;
};

export type CaseMedicalHistorySelection = {
  conditionId: string;
  conditionName?: string;
};

export type ClinicalCase = {
  id: string;
  title: string;
  slug: string;
  chiefComplaint: string | null;
  hpi: string | null;
  patientAge: number | null;
  patientSex: CasePatientSex | null;
  patientEthnicity: string | null;
  pastOcularHistory: string | null;
  pastMedicalHistory: string | null;
  medications: string | null;
  allergies: string | null;
  category: { id: string; name: string };
  difficulty: CaseDifficulty;
  audience: CaseAudience;
  status: CaseStatus;
  authorId: string | null;
  learningObjectives: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FindingRowCatalogEntry = {
  id: string;
  findingType: CaseFindingType;
  rowKey: string;
  rowLabel: string;
  defaultNormalOd: string | null;
  defaultNormalOs: string | null;
  position: number;
};

export type CaseFindingRow = {
  id: string;
  caseId: string;
  findingType: CaseFindingType;
  rowKey: string;
  odValue: string | null;
  osValue: string | null;
  position: number;
  /** Joined from catalog when loaded for display labels. */
  rowLabel?: string;
};

export type CaseFindingsByType = Record<CaseFindingType, CaseFindingRow[]>;

export type AncillaryTestType = {
  id: string;
  name: string;
  category: string | null;
  position: number;
  isActive: boolean;
};

export type CaseAncillaryTestMedia = {
  id: string;
  ancillaryTestId: string;
  mediaUrl: string;
  caption: string | null;
  position: number;
};

export type CaseAncillaryTest = {
  id: string;
  caseId: string;
  testTypeId: string | null;
  customTestName: string | null;
  reliability: string | null;
  odFindings: string | null;
  osFindings: string | null;
  notes: string | null;
  position: number;
  /** Resolved display name: catalog name or custom_test_name. */
  displayName: string;
  testType: AncillaryTestType | null;
  media: CaseAncillaryTestMedia[];
};

export type CaseQuestionEntry = {
  id: string;
  caseId: string;
  questionId: string;
  position: number;
  question: QuizQuestion;
};

export type CaseAttempt = {
  id: string;
  userId: string;
  caseId: string;
  status: CaseAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  scoreCorrect: number | null;
  scoreTotal: number | null;
  createdAt: string;
  updatedAt: string;
};

/** Published case with nested content for case-taking UI (downstream sessions). */
export type CaseWithDetails = ClinicalCase & {
  findingsByType: CaseFindingsByType;
  ancillaryTests: CaseAncillaryTest[];
  questions: CaseQuestionEntry[];
  ocularHistory: CaseOcularHistorySelection[];
  medicalHistory: CaseMedicalHistorySelection[];
};
