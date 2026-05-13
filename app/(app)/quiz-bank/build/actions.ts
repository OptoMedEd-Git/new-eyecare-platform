"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { pickMatchingQuestionIds, type QuizBuilderFilters } from "@/lib/quiz-bank/queries";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function buildAndStartQuiz(input: {
  title: string;
  filters: QuizBuilderFilters;
  count: number;
  timeLimitMinutes: number | null;
}): Promise<ActionResult<{ quizId: string; attemptId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) return { success: false, error: "Title is required" };
  if (trimmedTitle.length > 200) return { success: false, error: "Title too long" };

  if (input.count < 1 || input.count > 100) {
    return { success: false, error: "Question count must be between 1 and 100" };
  }

  const questionIds = await pickMatchingQuestionIds(input.filters, input.count);

  if (questionIds.length < input.count) {
    return {
      success: false,
      error: `Only ${questionIds.length} questions match these filters (you asked for ${input.count}). Try widening filters or reducing the count.`,
    };
  }

  const { data: quizRow, error: qErr } = await supabase
    .from("quizzes")
    .insert({
      slug: null,
      title: trimmedTitle,
      description: null,
      kind: "user_generated",
      category_id: input.filters.categoryIds.length === 1 ? input.filters.categoryIds[0] : null,
      target_audience: input.filters.audiences.length === 1 ? input.filters.audiences[0] : null,
      difficulty: input.filters.difficulties.length === 1 ? input.filters.difficulties[0] : null,
      time_limit_minutes: input.timeLimitMinutes,
      time_per_question_seconds: null,
      is_featured: false,
      status: "published",
      author_id: user.id,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (qErr || !quizRow) {
    console.error("buildAndStartQuiz: failed to create quiz:", qErr);
    return { success: false, error: "Could not create quiz" };
  }

  const quizId = quizRow.id as string;

  const items = questionIds.map((qid, idx) => ({
    quiz_id: quizId,
    question_id: qid,
    position: idx,
  }));

  const { error: iErr } = await supabase.from("quiz_items").insert(items);

  if (iErr) {
    console.error("buildAndStartQuiz: failed to insert items:", iErr);
    await supabase.from("quizzes").delete().eq("id", quizId);
    return { success: false, error: "Could not assemble quiz questions" };
  }

  const { data: attemptRow, error: aErr } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      status: "in_progress",
      time_limit_minutes: input.timeLimitMinutes,
    })
    .select("id")
    .single();

  if (aErr || !attemptRow) {
    console.error("buildAndStartQuiz: failed to create attempt:", aErr);
    await supabase.from("quizzes").delete().eq("id", quizId);
    return { success: false, error: "Could not start attempt" };
  }

  revalidatePath("/quiz-bank/my-quizzes");
  revalidatePath("/quiz-bank");
  revalidatePath("/quiz-bank/build");

  return {
    success: true,
    data: { quizId, attemptId: attemptRow.id as string },
  };
}

export async function renameUserQuiz(quizId: string, newTitle: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const trimmed = newTitle.trim();
  if (!trimmed) return { success: false, error: "Title cannot be empty" };
  if (trimmed.length > 200) return { success: false, error: "Title too long" };

  const { error } = await supabase
    .from("quizzes")
    .update({ title: trimmed })
    .eq("id", quizId)
    .eq("author_id", user.id)
    .eq("kind", "user_generated");

  if (error) return { success: false, error: "Could not rename quiz" };

  revalidatePath("/quiz-bank/my-quizzes");
  revalidatePath(`/quiz-bank/my-quizzes/${quizId}`);
  return { success: true };
}

export async function deleteUserQuiz(quizId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId)
    .eq("author_id", user.id)
    .eq("kind", "user_generated");

  if (error) return { success: false, error: "Could not delete quiz" };

  revalidatePath("/quiz-bank/my-quizzes");
  revalidatePath("/quiz-bank");
  return { success: true };
}
