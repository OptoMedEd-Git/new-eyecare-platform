"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { buildSingleBestAnswerPayload } from "@/lib/quiz-bank/answer-payload";
import { evaluateQuestionAnswer } from "@/lib/quiz-bank/scoring";
import { rowToQuizQuestion } from "@/lib/quiz-bank/queries";

type SubmitResult =
  | { success: true; isCorrect: boolean; correctChoiceId: string; explanation: string }
  | { success: false; error: string };

export async function submitQuestionResponse(questionId: string, choiceId: string): Promise<SubmitResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: qFull, error: qFullErr } = await supabase
    .from("quiz_questions")
    .select(
      `
      *,
      category:blog_categories(id, name),
      choices:quiz_question_choices(id, position, text, is_correct, question_id)
    `,
    )
    .eq("id", questionId)
    .eq("status", "published")
    .maybeSingle();

  if (qFullErr || !qFull) return { success: false, error: "Question not available" };

  const row = qFull as Record<string, unknown>;
  const choicesRaw = row.choices;
  const choiceRows = (
    Array.isArray(choicesRaw) ? choicesRaw : choicesRaw ? [choicesRaw] : []
  ) as Array<Record<string, unknown>>;

  const quizQuestion = rowToQuizQuestion(row, choiceRows);
  const selected = quizQuestion.choices.find((c) => c.id === choiceId);
  if (!selected) return { success: false, error: "Invalid choice" };

  const correctChoice = quizQuestion.choices.find((c) => c.isCorrect);
  if (!correctChoice) return { success: false, error: "Question has no correct answer set" };

  const isCorrect = evaluateQuestionAnswer(quizQuestion, choiceId);

  const { error: insErr } = await supabase.from("question_responses").insert({
    user_id: user.id,
    question_id: questionId,
    choice_id: choiceId,
    is_correct: isCorrect,
    answer_payload: buildSingleBestAnswerPayload(choiceId),
  });

  if (insErr) {
    console.error("Failed to save response:", insErr);
  }

  revalidatePath("/quiz-bank");
  revalidatePath("/quiz-bank/practice");

  return {
    success: true,
    isCorrect,
    correctChoiceId: correctChoice.id,
    explanation: String(row.explanation),
  };
}
