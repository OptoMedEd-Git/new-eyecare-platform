"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function flagQuestion(questionId: string, note?: string | null): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: question } = await supabase
    .from("quiz_questions")
    .select("id, status, author_id")
    .eq("id", questionId)
    .single();

  if (!question) return { success: false, error: "Question not found" };
  if (question.status !== "published" && question.author_id !== user.id) {
    return { success: false, error: "Cannot flag this question" };
  }

  const { error } = await supabase.from("flagged_questions").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      note: note ?? null,
    },
    { onConflict: "user_id,question_id", ignoreDuplicates: false },
  );

  if (error) {
    console.error("flagQuestion error:", error);
    return { success: false, error: "Could not flag question" };
  }

  revalidatePath("/quiz-bank/flagged");
  revalidatePath("/quiz-bank");
  return { success: true };
}

export async function unflagQuestion(questionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("flagged_questions")
    .delete()
    .eq("user_id", user.id)
    .eq("question_id", questionId);

  if (error) {
    console.error("unflagQuestion error:", error);
    return { success: false, error: "Could not unflag question" };
  }

  revalidatePath("/quiz-bank/flagged");
  revalidatePath("/quiz-bank");
  return { success: true };
}

export async function updateFlagNote(questionId: string, note: string | null): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("flagged_questions")
    .update({ note })
    .eq("user_id", user.id)
    .eq("question_id", questionId);

  if (error) return { success: false, error: "Could not update note" };

  revalidatePath("/quiz-bank/flagged");
  return { success: true };
}
