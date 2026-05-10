"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type SubmitResult =
  | { success: true; isCorrect: boolean; correctChoiceId: string; explanation: string }
  | { success: false; error: string };

export async function submitQuestionResponse(questionId: string, choiceId: string): Promise<SubmitResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: published } = await supabase
    .from("quiz_questions")
    .select("id")
    .eq("id", questionId)
    .eq("status", "published")
    .maybeSingle();

  if (!published) return { success: false, error: "Question not available" };

  const { data: choice, error: cErr } = await supabase
    .from("quiz_question_choices")
    .select("id, is_correct, question_id")
    .eq("id", choiceId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (cErr || !choice) return { success: false, error: "Invalid choice" };

  const { data: question, error: qErr } = await supabase
    .from("quiz_questions")
    .select("explanation")
    .eq("id", questionId)
    .maybeSingle();

  if (qErr || !question) return { success: false, error: "Question not found" };

  const { data: correctChoice, error: ccErr } = await supabase
    .from("quiz_question_choices")
    .select("id")
    .eq("question_id", questionId)
    .eq("is_correct", true)
    .maybeSingle();

  if (ccErr || !correctChoice) return { success: false, error: "Question has no correct answer set" };

  const { error: insErr } = await supabase.from("question_responses").insert({
    user_id: user.id,
    question_id: questionId,
    choice_id: choiceId,
    is_correct: choice.is_correct,
  });

  if (insErr) {
    console.error("Failed to save response:", insErr);
  }

  revalidatePath("/quiz-bank");
  revalidatePath("/quiz-bank/practice");

  return {
    success: true,
    isCorrect: choice.is_correct,
    correctChoiceId: correctChoice.id,
    explanation: String(question.explanation),
  };
}
