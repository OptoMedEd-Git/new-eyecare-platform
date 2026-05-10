import { createClient } from "@/lib/supabase/server";

import type {
  PracticeFilters,
  PracticeQuestionResult,
  PracticeStats,
  QuestionAudience,
  Quiz,
  QuizAttempt,
  QuizChoice,
  QuizDifficulty,
  QuizBankCategoryAccuracyRow,
  QuizBankDailyAccuracyRow,
  QuizBankDashboardData,
  QuizListing,
  QuizQuestion,
  QuizQuestionType,
  QuizWithQuestions,
} from "./types";

export type FlaggedQuestionEntry = {
  question: QuizQuestion;
  flaggedAt: string;
  note: string | null;
};

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function rowToQuizQuestion(
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

function rowToQuiz(row: Record<string, unknown>): Quiz {
  const cat = single(row.category as { id: string; name: string } | { id: string; name: string }[] | null);

  return {
    id: String(row.id),
    slug: row.slug == null ? null : String(row.slug),
    title: String(row.title),
    description: row.description == null ? null : String(row.description),
    kind: row.kind as Quiz["kind"],
    category: cat,
    audience: (row.target_audience as QuestionAudience | null) ?? null,
    difficulty: (row.difficulty as QuizDifficulty | null) ?? null,
    timeLimitMinutes: row.time_limit_minutes == null ? null : Number(row.time_limit_minutes),
    timePerQuestionSeconds:
      row.time_per_question_seconds == null ? null : Number(row.time_per_question_seconds),
    isFeatured: Boolean(row.is_featured),
    status: row.status as Quiz["status"],
    authorId: row.author_id == null ? null : String(row.author_id),
    publishedAt: row.published_at == null ? null : String(row.published_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function rowToAttempt(row: Record<string, unknown>): QuizAttempt {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    quizId: String(row.quiz_id),
    status: row.status as QuizAttempt["status"],
    startedAt: String(row.started_at),
    submittedAt: row.submitted_at == null ? null : String(row.submitted_at),
    abandonedAt: row.abandoned_at == null ? null : String(row.abandoned_at),
    scoreCorrect: row.score_correct == null ? null : Number(row.score_correct),
    scoreTotal: row.score_total == null ? null : Number(row.score_total),
    timeLimitMinutes: row.time_limit_minutes == null ? null : Number(row.time_limit_minutes),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

/**
 * List of all published curated quizzes, with question counts.
 * Used by /quiz-bank/quizzes index.
 */
export async function getPublishedQuizzes(): Promise<QuizListing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      category:blog_categories(id, name),
      quiz_items(count)
    `,
    )
    .eq("status", "published")
    .eq("kind", "curated")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  return data.map((raw) => {
    const row = raw as Record<string, unknown>;
    const itemsEmbed = row.quiz_items as unknown;
    const countRow = Array.isArray(itemsEmbed) ? (itemsEmbed[0] as { count?: number } | undefined) : undefined;
    const questionCount = typeof countRow?.count === "number" ? countRow.count : 0;
    return {
      ...rowToQuiz(row),
      questionCount,
    };
  });
}

/**
 * Most recently published featured curated quiz, with question count.
 * Returns null if none exist or if the row has no slug (cannot link).
 */
export async function getFeaturedQuiz(): Promise<QuizListing | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      category:blog_categories(id, name),
      quiz_items(count)
    `,
    )
    .eq("status", "published")
    .eq("kind", "curated")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  if (row.slug == null || String(row.slug).length === 0) return null;

  const itemsEmbed = row.quiz_items as unknown;
  const countRow = Array.isArray(itemsEmbed) ? (itemsEmbed[0] as { count?: number } | undefined) : undefined;
  const questionCount = typeof countRow?.count === "number" ? countRow.count : 0;

  return {
    ...rowToQuiz(row),
    questionCount,
  };
}

/**
 * Get a single published quiz by slug, with full question data (ordered by position).
 */
export async function getPublishedQuizBySlug(slug: string): Promise<QuizWithQuestions | null> {
  const supabase = await createClient();

  const { data: quizRow, error: qErr } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      category:blog_categories(id, name)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("kind", "curated")
    .maybeSingle();

  if (qErr || !quizRow) return null;

  const { data: itemsData, error: iErr } = await supabase
    .from("quiz_items")
    .select(
      `
      position,
      question:quiz_questions(
        *,
        category:blog_categories(id, name),
        choices:quiz_question_choices(id, position, text, is_correct)
      )
    `,
    )
    .eq("quiz_id", quizRow.id as string)
    .order("position", { ascending: true });

  if (iErr || !itemsData) return null;

  const questions: QuizQuestion[] = [];

  for (const item of itemsData as Array<Record<string, unknown>>) {
    const qRaw = item.question;
    const questionRow = Array.isArray(qRaw) ? qRaw[0] : qRaw;
    if (!questionRow || typeof questionRow !== "object") continue;

    const q = questionRow as Record<string, unknown>;
    const choicesRaw = q.choices;
    const choiceRows = (
      Array.isArray(choicesRaw) ? choicesRaw : choicesRaw ? [choicesRaw] : []
    ) as Array<Record<string, unknown>>;

    questions.push(rowToQuizQuestion(q, choiceRows));
  }

  return {
    ...rowToQuiz(quizRow as Record<string, unknown>),
    questions,
  };
}

export async function getUserActiveAttemptForQuiz(quizId: string): Promise<QuizAttempt | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("quiz_id", quizId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return rowToAttempt(data as Record<string, unknown>);
}

export async function getQuizAttemptWithResponses(attemptId: string): Promise<{
  attempt: QuizAttempt;
  responses: { questionId: string; choiceId: string }[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: attemptData, error: aErr } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (aErr || !attemptData) return null;

  const { data: responsesData, error: rErr } = await supabase
    .from("question_responses")
    .select("question_id, choice_id")
    .eq("quiz_attempt_id", attemptId)
    .eq("user_id", user.id);

  if (rErr) {
    return { attempt: rowToAttempt(attemptData as Record<string, unknown>), responses: [] };
  }

  return {
    attempt: rowToAttempt(attemptData as Record<string, unknown>),
    responses: (responsesData ?? []).map((r) => ({
      questionId: String((r as { question_id: string }).question_id),
      choiceId: String((r as { choice_id: string }).choice_id),
    })),
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
    .eq("user_id", user.id)
    .is("quiz_attempt_id", null);

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

  const { data, error } = await supabase
    .from("question_responses")
    .select("question_id")
    .eq("user_id", user.id)
    .is("quiz_attempt_id", null);

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
    .is("quiz_attempt_id", null)
    .order("answered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return { wasCorrect: Boolean(data.is_correct) };
}

/**
 * Get IDs of all questions the current user has flagged.
 * Returns a Set for O(1) membership checks.
 */
export async function getFlaggedQuestionIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase.from("flagged_questions").select("question_id").eq("user_id", user.id);

  if (error || !data) return new Set();
  return new Set(data.map((r) => r.question_id as string));
}

/**
 * Check if a specific question is flagged by the current user.
 */
export async function isQuestionFlagged(questionId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("flagged_questions")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .maybeSingle();

  if (error) return false;
  return !!data;
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

  const isFlagged = user ? await isQuestionFlagged(String(picked.id)) : false;

  return {
    question: rowToQuizQuestion(picked, choices as Record<string, unknown>[]),
    previouslyAnswered,
    previousResult: previousResult ? { wasCorrect: previousResult.wasCorrect } : undefined,
    isFlagged,
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

/** Full data needed to render the quiz results screen. */
export type QuizAttemptResult = {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: Array<{
    question: QuizQuestion;
    userChoiceId: string | null;
    isCorrect: boolean | null;
  }>;
  totalTimeSeconds: number | null;
};

export async function getQuizResultsForAttempt(attemptId: string): Promise<QuizAttemptResult | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: attemptRow, error: aErr } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (aErr || !attemptRow) return null;

  const quizId = String((attemptRow as Record<string, unknown>).quiz_id);

  const { data: quizRow, error: qErr } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      category:blog_categories(id, name)
    `,
    )
    .eq("id", quizId)
    .maybeSingle();

  if (qErr || !quizRow) return null;

  const { data: itemsData, error: iErr } = await supabase
    .from("quiz_items")
    .select(
      `
      position,
      question:quiz_questions(
        *,
        category:blog_categories(id, name),
        choices:quiz_question_choices(id, position, text, is_correct)
      )
    `,
    )
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  if (iErr || !itemsData) return null;

  const { data: responsesData } = await supabase
    .from("question_responses")
    .select("question_id, choice_id, is_correct")
    .eq("quiz_attempt_id", attemptId)
    .eq("user_id", user.id);

  const responseByQuestion = new Map<string, { choiceId: string; isCorrect: boolean }>();
  for (const r of responsesData ?? []) {
    const row = r as { question_id: string; choice_id: string; is_correct: boolean };
    responseByQuestion.set(row.question_id, {
      choiceId: row.choice_id,
      isCorrect: Boolean(row.is_correct),
    });
  }

  const questions: QuizAttemptResult["questions"] = [];

  for (const item of itemsData as Array<Record<string, unknown>>) {
    const qRaw = item.question;
    const questionRow = Array.isArray(qRaw) ? qRaw[0] : qRaw;
    if (!questionRow || typeof questionRow !== "object") continue;

    const q = questionRow as Record<string, unknown>;
    const choicesRaw = q.choices;
    const choiceRows = (
      Array.isArray(choicesRaw) ? choicesRaw : choicesRaw ? [choicesRaw] : []
    ) as Array<Record<string, unknown>>;

    const question = rowToQuizQuestion(q, choiceRows);
    const response = responseByQuestion.get(question.id);

    questions.push({
      question,
      userChoiceId: response?.choiceId ?? null,
      isCorrect: response ? response.isCorrect : null,
    });
  }

  const ar = attemptRow as Record<string, unknown>;
  let totalTimeSeconds: number | null = null;
  if (ar.started_at && ar.submitted_at) {
    const start = new Date(String(ar.started_at)).getTime();
    const end = new Date(String(ar.submitted_at)).getTime();
    totalTimeSeconds = Math.floor((end - start) / 1000);
  }

  return {
    attempt: rowToAttempt(ar),
    quiz: rowToQuiz(quizRow as Record<string, unknown>),
    questions,
    totalTimeSeconds,
  };
}

export async function getUserAttemptsForQuiz(quizId: string): Promise<QuizAttempt[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("quiz_id", quizId)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => rowToAttempt(row as Record<string, unknown>));
}

/** Published question count (anonymous-safe; used for unanswered tally). */
export async function getPublishedQuizQuestionCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("quiz_questions")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  if (error) return 0;
  return count ?? 0;
}

type PracticeResponseRow = {
  question_id: string;
  is_correct: boolean;
  answered_at: string;
  question?: unknown;
};

function aggregateCategoryAccuracy(
  rows: PracticeResponseRow[],
): QuizBankCategoryAccuracyRow[] {
  const categoryMap = new Map<string, { correct: number; total: number }>();

  for (const raw of rows) {
    const q = raw.question;
    const questionRow = Array.isArray(q) ? q[0] : q;
    let categoryName = "Uncategorized";
    if (questionRow && typeof questionRow === "object") {
      const cat = (questionRow as { category?: unknown }).category;
      const c = Array.isArray(cat) ? cat[0] : cat;
      if (c && typeof c === "object" && c !== null && "name" in c) {
        categoryName = String((c as { name: string }).name);
      }
    }
    const agg = categoryMap.get(categoryName) ?? { correct: 0, total: 0 };
    agg.total += 1;
    if (raw.is_correct) agg.correct += 1;
    categoryMap.set(categoryName, agg);
  }

  return Array.from(categoryMap.entries())
    .map(([category, { correct, total }]) => ({
      category,
      total,
      correct,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage || a.category.localeCompare(b.category));
}

function aggregateAccuracyOverTime(rows: PracticeResponseRow[]): QuizBankDailyAccuracyRow[] {
  const dayMap = new Map<string, { correct: number; total: number }>();

  for (const raw of rows) {
    const dateKey = new Date(raw.answered_at).toISOString().slice(0, 10);
    const agg = dayMap.get(dateKey) ?? { correct: 0, total: 0 };
    agg.total += 1;
    if (raw.is_correct) agg.correct += 1;
    dayMap.set(dateKey, agg);
  }

  const sortedKeys = [...dayMap.keys()].sort();
  return sortedKeys.map((dateKey) => {
    const { correct, total } = dayMap.get(dateKey)!;
    const d = new Date(`${dateKey}T12:00:00.000Z`);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return {
      dateKey,
      label,
      accuracyPct: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });
}

/**
 * Stats + chart series for the quiz bank dashboard.
 * Uses one practice-response fetch and aggregates category + daily accuracy in memory.
 */
export async function getQuizBankDashboardData(): Promise<QuizBankDashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publishedCount = await getPublishedQuizQuestionCount();

  if (!user) {
    return {
      stats: { totalAnswered: 0, totalCorrect: 0, totalUniqueQuestionsAnswered: 0 },
      accuracyPct: 0,
      unansweredCount: publishedCount,
      categoryAccuracy: [],
      accuracyOverTime: [],
    };
  }

  const { data: responses, error } = await supabase
    .from("question_responses")
    .select(
      `
      question_id,
      is_correct,
      answered_at,
      question:quiz_questions(
        category:blog_categories(name)
      )
    `,
    )
    .eq("user_id", user.id)
    .is("quiz_attempt_id", null);

  if (error || !responses?.length) {
    const stats = await getPracticeStats();
    const accuracyPct =
      stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
    return {
      stats,
      accuracyPct,
      unansweredCount: Math.max(0, publishedCount - stats.totalUniqueQuestionsAnswered),
      categoryAccuracy: [],
      accuracyOverTime: [],
    };
  }

  const rows = responses as PracticeResponseRow[];
  const uniqueIds = new Set(rows.map((r) => r.question_id));
  const totalAnswered = rows.length;
  const totalCorrect = rows.filter((r) => r.is_correct).length;
  const accuracyPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return {
    stats: {
      totalAnswered,
      totalCorrect,
      totalUniqueQuestionsAnswered: uniqueIds.size,
    },
    accuracyPct,
    unansweredCount: Math.max(0, publishedCount - uniqueIds.size),
    categoryAccuracy: aggregateCategoryAccuracy(rows),
    accuracyOverTime: aggregateAccuracyOverTime(rows),
  };
}

/**
 * Get all flagged questions for the current user with full question data.
 * Sorted newest-flagged first.
 */
export async function getFlaggedQuestionsForUser(): Promise<FlaggedQuestionEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("flagged_questions")
    .select(
      `
      flagged_at,
      note,
      question:quiz_questions(
        *,
        category:blog_categories(id, name),
        choices:quiz_question_choices(id, position, text, is_correct)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("flagged_at", { ascending: false });

  if (error || !data) return [];

  const out: FlaggedQuestionEntry[] = [];

  for (const row of data as Array<{
    flagged_at: string;
    note: string | null;
    question: Record<string, unknown> | Record<string, unknown>[] | null;
  }>) {
    const qRaw = row.question;
    const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;
    if (!q || typeof q !== "object") continue;

    const choicesEmbed = (q as { choices?: unknown }).choices;
    const choiceRows = Array.isArray(choicesEmbed) ? (choicesEmbed as Record<string, unknown>[]) : [];

    out.push({
      question: rowToQuizQuestion(q as Record<string, unknown>, choiceRows),
      flaggedAt: row.flagged_at,
      note: row.note,
    });
  }

  return out;
}

/**
 * Count of flagged questions for the current user.
 * Cheaper than getFlaggedQuestionsForUser when you just need the number.
 */
export async function getFlaggedCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("flagged_questions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) return 0;
  return count ?? 0;
}
