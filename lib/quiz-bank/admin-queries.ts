import { createClient } from "@/lib/supabase/server";

import { rowToQuizQuestion } from "./queries";
import type { QuizQuestion } from "./types";

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export type AdminQuestionAuthor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

/** Generalized question (`rowToQuizQuestion` + `question_type` branch) plus admin-only joins. */
export type AdminQuestionRow = QuizQuestion & {
  author: AdminQuestionAuthor | null;
  /** Raw `quiz_questions.category_id` for authoring when the category embed is absent. */
  categoryId: string | null;
};

function choiceRowsFromRow(row: Record<string, unknown>): Array<Record<string, unknown>> {
  const choicesRaw = row.choices;
  return (
    Array.isArray(choicesRaw) ? choicesRaw : choicesRaw ? [choicesRaw] : []
  ) as Array<Record<string, unknown>>;
}

function toAdminQuestionRow(row: Record<string, unknown>, author: AdminQuestionAuthor | null): AdminQuestionRow {
  const question = rowToQuizQuestion(row, choiceRowsFromRow(row));
  return {
    ...question,
    author,
    categoryId: row.category_id == null ? null : String(row.category_id),
  };
}

function missingAdminQuestionRow(): AdminQuestionRow {
  const row: Record<string, unknown> = {
    id: "",
    vignette: null,
    question_text: "(Missing question)",
    explanation: "",
    image_url: null,
    image_attribution: null,
    question_type: "single_best_answer",
    target_audience: null,
    difficulty: "intermediate",
    status: "published",
    author_id: null,
    published_at: null,
    created_at: "",
    updated_at: "",
    category_id: null,
    category: null,
    choices: [],
  };
  return toAdminQuestionRow(row, null);
}

export async function getAllAdminQuestions(userId: string): Promise<AdminQuestionRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_questions")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!quiz_questions_author_id_fkey(id, first_name, last_name),
      choices:quiz_question_choices(id, position, text, is_correct, question_id)
    `,
    )
    .eq("author_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[quiz-bank admin] list questions", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const author = single(r.author as AdminQuestionAuthor | AdminQuestionAuthor[] | null) as AdminQuestionAuthor | null;
    return toAdminQuestionRow(r, author);
  });
}

export async function getAdminQuestionById(id: string, userId: string): Promise<AdminQuestionRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_questions")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!quiz_questions_author_id_fkey(id, first_name, last_name),
      choices:quiz_question_choices(id, position, text, is_correct, question_id)
    `,
    )
    .eq("id", id)
    .eq("author_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[quiz-bank admin] get question", error.message);
    return null;
  }

  if (!data) return null;

  const row = data as Record<string, unknown>;
  const author = single(row.author as AdminQuestionAuthor | AdminQuestionAuthor[] | null) as AdminQuestionAuthor | null;
  return toAdminQuestionRow(row, author);
}

export type AdminQuizAuthor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export type AdminQuizRow = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  kind: string;
  category_id: string | null;
  category: { id: string; name: string } | null;
  target_audience: string | null;
  difficulty: string | null;
  time_limit_minutes: number | null;
  time_per_question_seconds: number | null;
  is_featured: boolean;
  status: string;
  author_id: string | null;
  author: AdminQuizAuthor | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  question_count: number;
};

export type AdminQuizItemRow = {
  id: string;
  quiz_id: string;
  question_id: string;
  position: number;
  question: AdminQuestionRow;
};

function normalizeAdminQuestionRow(raw: unknown): AdminQuestionRow {
  const rowObj = single(raw as Record<string, unknown> | Record<string, unknown>[] | null);
  if (!rowObj || typeof rowObj !== "object") {
    return missingAdminQuestionRow();
  }
  const row = rowObj as Record<string, unknown>;
  const author = single(row.author as AdminQuestionAuthor | AdminQuestionAuthor[] | null) as AdminQuestionAuthor | null;
  return toAdminQuestionRow(row, author);
}

export async function getAllAdminQuizzes(userId: string): Promise<AdminQuizRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!quizzes_author_id_fkey(id, first_name, last_name),
      quiz_items(count)
    `,
    )
    .eq("kind", "curated")
    .eq("author_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[quiz-bank admin] list quizzes", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const embed = r.quiz_items as { count: number }[] | null | undefined;
    const countEl = Array.isArray(embed) ? embed[0] : null;
    const question_count = countEl?.count ?? 0;

    return {
      ...(row as unknown as AdminQuizRow),
      category: single(r.category as AdminQuizRow["category"]),
      author: single(r.author as AdminQuizRow["author"]),
      question_count,
    };
  });
}

export async function getAdminQuizById(
  id: string,
  userId: string,
): Promise<{ quiz: AdminQuizRow; items: AdminQuizItemRow[] } | null> {
  const supabase = await createClient();

  const { data: quizData, error: quizErr } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!quizzes_author_id_fkey(id, first_name, last_name)
    `,
    )
    .eq("id", id)
    .eq("author_id", userId)
    .maybeSingle();

  if (quizErr || !quizData) return null;

  const { data: itemsData, error: itemsErr } = await supabase
    .from("quiz_items")
    .select(
      `
      *,
      question:quiz_questions(
        *,
        category:blog_categories(id, name),
        choices:quiz_question_choices(id, position, text, is_correct, question_id)
      )
    `,
    )
    .eq("quiz_id", id)
    .order("position", { ascending: true });

  if (itemsErr) {
    console.error("[quiz-bank admin] quiz items", itemsErr.message);
    return null;
  }

  const items: AdminQuizItemRow[] = (itemsData ?? []).map((item) => {
    const it = item as Record<string, unknown>;
    const qRaw = it.question;
    return {
      ...(item as AdminQuizItemRow),
      question: normalizeAdminQuestionRow(qRaw),
    };
  });

  const quiz: AdminQuizRow = {
    ...(quizData as unknown as AdminQuizRow),
    category: single(quizData.category as AdminQuizRow["category"]),
    author: single(quizData.author as AdminQuizRow["author"]),
    question_count: items.length,
  };

  return { quiz, items };
}

function sanitizeIlikeTerm(term: string): string {
  return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function getAvailableQuestionsForPicker(
  excludeQuizId: string | null,
  filters: {
    search?: string;
    categoryIds?: string[];
    audiences?: string[];
    difficulties?: string[];
  } = {},
): Promise<AdminQuestionRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("quiz_questions")
    .select(
      `
      *,
      category:blog_categories(id, name),
      choices:quiz_question_choices(id, position, text, is_correct, question_id)
    `,
    )
    .eq("status", "published");

  const term = filters.search?.trim();
  if (term) {
    const s = sanitizeIlikeTerm(term);
    query = query.or(`vignette.ilike.%${s}%,question_text.ilike.%${s}%`);
  }
  if (filters.categoryIds?.length) {
    query = query.in("category_id", filters.categoryIds);
  }
  if (filters.audiences?.length) {
    query = query.in("target_audience", filters.audiences);
  }
  if (filters.difficulties?.length) {
    query = query.in("difficulty", filters.difficulties);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(100);

  if (error) {
    console.error("[quiz-bank admin] picker questions", error.message);
    return [];
  }

  let questions = (data ?? []).map((q) => normalizeAdminQuestionRow(q));

  if (excludeQuizId) {
    const { data: existingItems } = await supabase
      .from("quiz_items")
      .select("question_id")
      .eq("quiz_id", excludeQuizId);
    const excludeSet = new Set((existingItems ?? []).map((r) => r.question_id as string));
    questions = questions.filter((q) => !excludeSet.has(q.id));
  }

  return questions;
}
