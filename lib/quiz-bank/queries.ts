import { createClient } from "@/lib/supabase/server";

import type {
  PracticeFilters,
  PracticeQuestionResult,
  PracticeStats,
  QuestionAudience,
  QuizChoice,
  QuizDifficulty,
  QuizQuestion,
  QuizQuestionType,
} from "./types";

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function rowToQuizQuestion(
  row: Record<string, unknown>,
  choiceRows: Array<Record<string, unknown>>,
): QuizQuestion {
  const choices: QuizChoice[] = choiceRows
    .map((c) => ({
      id: String(c.id),
      questionId: String(c.question_id),
      position: Number(c.position),
      text: String(c.text),
      isCorrect: Boolean(c.is_correct),
    }))
    .sort((a, b) => a.position - b.position);

  const cat = single(row.category as { id: string; name: string } | { id: string; name: string }[] | null);

  return {
    id: String(row.id),
    vignette: row.vignette == null ? null : String(row.vignette),
    questionText: String(row.question_text),
    explanation: String(row.explanation),
    imageUrl: row.image_url == null ? null : String(row.image_url),
    imageAttribution: row.image_attribution == null ? null : String(row.image_attribution),
    questionType: row.question_type as QuizQuestionType,
    category: cat,
    audience: (row.target_audience as QuestionAudience | null) ?? null,
    difficulty: row.difficulty as QuizDifficulty,
    status: row.status as QuizQuestion["status"],
    authorId: row.author_id == null ? null : String(row.author_id),
    publishedAt: row.published_at == null ? null : String(row.published_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    choices,
  };
}

export async function getPracticeStats(): Promise<PracticeStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { totalAnswered: 0, totalCorrect: 0, totalUniqueQuestionsAnswered: 0 };
  }

  const { data: responses, error } = await supabase
    .from("question_responses")
    .select("question_id, is_correct")
    .eq("user_id", user.id);

  if (error || !responses) {
    return { totalAnswered: 0, totalCorrect: 0, totalUniqueQuestionsAnswered: 0 };
  }

  const uniqueIds = new Set(responses.map((r) => r.question_id as string));
  return {
    totalAnswered: responses.length,
    totalCorrect: responses.filter((r) => r.is_correct).length,
    totalUniqueQuestionsAnswered: uniqueIds.size,
  };
}

export async function getAnsweredQuestionIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase.from("question_responses").select("question_id").eq("user_id", user.id);

  if (error || !data) return new Set();
  return new Set(data.map((r) => r.question_id as string));
}

export async function getLatestResponseForQuestion(questionId: string): Promise<{ wasCorrect: boolean } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("question_responses")
    .select("is_correct")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .order("answered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return { wasCorrect: Boolean(data.is_correct) };
}

export async function getRandomPracticeQuestion(filters: PracticeFilters): Promise<PracticeQuestionResult | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("quiz_questions")
    .select(
      `
      *,
      category:blog_categories(id, name)
    `,
    )
    .eq("status", "published");

  if (filters.categoryIds.length > 0) {
    query = query.in("category_id", filters.categoryIds);
  }
  if (filters.audiences.length > 0) {
    query = query.in("target_audience", filters.audiences);
  }
  if (filters.difficulties.length > 0) {
    query = query.in("difficulty", filters.difficulties);
  }

  const { data: matchingQuestions, error } = await query;
  if (error || !matchingQuestions?.length) return null;

  const rows = matchingQuestions as Record<string, unknown>[];
  const answeredIds = user ? await getAnsweredQuestionIds() : new Set<string>();

  const unanswered = rows.filter((q) => !answeredIds.has(String(q.id)));
  const pool = unanswered.length > 0 ? unanswered : rows;

  const picked = pool[Math.floor(Math.random() * pool.length)] as Record<string, unknown>;

  const { data: choices, error: cErr } = await supabase
    .from("quiz_question_choices")
    .select("*")
    .eq("question_id", picked.id);

  if (cErr || !choices?.length) return null;

  const previouslyAnswered = answeredIds.has(String(picked.id));
  const previousResult = previouslyAnswered ? await getLatestResponseForQuestion(String(picked.id)) : null;

  return {
    question: rowToQuizQuestion(picked, choices as Record<string, unknown>[]),
    previouslyAnswered,
    previousResult: previousResult ? { wasCorrect: previousResult.wasCorrect } : undefined,
  };
}

export async function getActiveQuestionCategories(): Promise<{ id: string; name: string; count: number }[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_questions")
    .select(
      `
      category_id,
      category:blog_categories(id, name)
    `,
    )
    .eq("status", "published")
    .not("category_id", "is", null);

  if (error || !data) return [];

  const counts = new Map<string, { name: string; count: number }>();
  for (const raw of data as Array<{ category_id?: string | null; category?: unknown }>) {
    const cat = single(raw.category as { id: string; name: string } | { id: string; name: string }[] | null);
    if (!cat?.id) continue;
    const existing = counts.get(cat.id);
    counts.set(cat.id, {
      name: cat.name,
      count: (existing?.count ?? 0) + 1,
    });
  }

  return Array.from(counts.entries())
    .map(([id, v]) => ({ id, name: v.name, count: v.count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
