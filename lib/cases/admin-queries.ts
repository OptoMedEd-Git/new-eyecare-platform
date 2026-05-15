import { createClient } from "@/lib/supabase/server";

import {
  getCaseAncillaryTestsWithMedia,
  getCaseFindingsGrouped,
  getCaseQuestionsWithQuizQuestions,
  rowToCase,
} from "./queries";
import type { CaseWithDetails, ClinicalCase } from "./types";

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export type AdminCaseRow = ClinicalCase & {
  author: { id: string; first_name: string | null; last_name: string | null } | null;
  questionCount: number;
};

const ADMIN_CASE_LIST_SELECT = `
  *,
  category:blog_categories(id, name),
  author:profiles!cases_author_id_fkey(id, first_name, last_name),
  case_questions(count)
`;

function mapAdminListRow(row: Record<string, unknown>): AdminCaseRow {
  const embed = row.case_questions as { count: number }[] | null | undefined;
  const countEl = Array.isArray(embed) ? embed[0] : null;
  const base = rowToCase(row);

  return {
    ...base,
    author: single(
      row.author as AdminCaseRow["author"] | AdminCaseRow["author"][] | null,
    ),
    questionCount: countEl?.count ?? 0,
  };
}

/**
 * Cases authored by the current user (admin authoring list foundation).
 */
export async function getAdminCasesForAuthor(userId: string): Promise<AdminCaseRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cases")
    .select(ADMIN_CASE_LIST_SELECT)
    .eq("author_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[cases admin] list", error.message);
    return [];
  }

  return (data as Array<Record<string, unknown>>).map(mapAdminListRow);
}

/**
 * Single case by slug for authoring (draft or published), including nested content.
 */
export async function getAdminCaseWithDetailsBySlug(
  slug: string,
  authorId: string,
): Promise<CaseWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cases")
    .select(
      `
      *,
      category:blog_categories(id, name)
    `,
    )
    .eq("slug", slug)
    .eq("author_id", authorId)
    .maybeSingle();

  if (error || !data) return null;

  const clinicalCase = rowToCase(data as Record<string, unknown>);

  const [findingsByType, ancillaryTests, questions] = await Promise.all([
    getCaseFindingsGrouped(clinicalCase.id),
    getCaseAncillaryTestsWithMedia(clinicalCase.id),
    getCaseQuestionsWithQuizQuestions(clinicalCase.id),
  ]);

  return {
    ...clinicalCase,
    findingsByType,
    ancillaryTests,
    questions,
  };
}

/**
 * Single case by id for authoring.
 */
export async function getAdminCaseWithDetailsById(
  caseId: string,
  authorId: string,
): Promise<CaseWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cases")
    .select(
      `
      *,
      category:blog_categories(id, name)
    `,
    )
    .eq("id", caseId)
    .eq("author_id", authorId)
    .maybeSingle();

  if (error || !data) return null;

  const clinicalCase = rowToCase(data as Record<string, unknown>);

  const [findingsByType, ancillaryTests, questions] = await Promise.all([
    getCaseFindingsGrouped(clinicalCase.id),
    getCaseAncillaryTestsWithMedia(clinicalCase.id),
    getCaseQuestionsWithQuizQuestions(clinicalCase.id),
  ]);

  return {
    ...clinicalCase,
    findingsByType,
    ancillaryTests,
    questions,
  };
}
