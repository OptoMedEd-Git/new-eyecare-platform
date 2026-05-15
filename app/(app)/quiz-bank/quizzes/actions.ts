"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  buildImageStimulusPayload,
  buildMultiSelectPayload,
  buildSingleBestAnswerPayload,
  buildTrueFalsePayload,
} from "@/lib/quiz-bank/answer-payload";
import { rowToQuizQuestion } from "@/lib/quiz-bank/queries";
import { evaluateQuestionAnswer } from "@/lib/quiz-bank/scoring";
import {
  isImageStimulusQuestion,
  isMultiSelectQuestion,
  isSingleBestAnswerQuestion,
  isTrueFalseQuestion,
  type SubmittedQuestionAnswer,
} from "@/lib/quiz-bank/types";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function startOrResumeQuizAttempt(
  quizId: string,
): Promise<ActionResult<{ attemptId: string; resumed: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: quiz, error: qErr } = await supabase
    .from("quizzes")
    .select("id, status, time_limit_minutes")
    .eq("id", quizId)
    .eq("status", "published")
    .maybeSingle();

  if (qErr || !quiz) return { success: false, error: "Quiz not found or not published" };

  const { data: existing } = await supabase
    .from("quiz_attempts")
    .select("id")
    .eq("user_id", user.id)
    .eq("quiz_id", quizId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { success: true, data: { attemptId: existing.id as string, resumed: true } };
  }

  const { data: newAttempt, error: insErr } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      status: "in_progress",
      time_limit_minutes: quiz.time_limit_minutes,
    })
    .select("id")
    .single();

  if (insErr || !newAttempt) {
    console.error("startOrResumeQuizAttempt error:", insErr);
    return { success: false, error: "Could not start attempt" };
  }

  return { success: true, data: { attemptId: newAttempt.id as string, resumed: false } };
}

export async function saveAnswerToAttempt(
  attemptId: string,
  questionId: string,
  answer: SubmittedQuestionAnswer,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("id, status")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!attempt) return { success: false, error: "Attempt not found" };
  if (attempt.status !== "in_progress") {
    return { success: false, error: "Cannot modify a submitted attempt" };
  }

  const { data: qFull, error: qErr } = await supabase
    .from("quiz_questions")
    .select(
      `
      *,
      category:blog_categories(id, name),
      choices:quiz_question_choices(id, position, text, is_correct, question_id),
      true_false:quiz_question_true_false(question_id, correct_answer)
    `,
    )
    .eq("id", questionId)
    .maybeSingle();

  if (qErr || !qFull) return { success: false, error: "Question not found" };

  const row = qFull as Record<string, unknown>;
  const choicesRaw = row.choices;
  const choiceRows = (
    Array.isArray(choicesRaw) ? choicesRaw : choicesRaw ? [choicesRaw] : []
  ) as Array<Record<string, unknown>>;

  const quizQuestion = rowToQuizQuestion(row, choiceRows);

  let isCorrect: boolean;
  let insertRow: {
    user_id: string;
    question_id: string;
    choice_id: string | null;
    is_correct: boolean;
    quiz_attempt_id: string;
    answer_payload:
      | ReturnType<typeof buildSingleBestAnswerPayload>
      | ReturnType<typeof buildImageStimulusPayload>
      | ReturnType<typeof buildTrueFalsePayload>
      | ReturnType<typeof buildMultiSelectPayload>;
  };

  if (isSingleBestAnswerQuestion(quizQuestion)) {
    if (answer.type !== "single_best_answer") {
      return { success: false, error: "This question expects a multiple-choice answer" };
    }
    const selected = quizQuestion.choices.find((c) => c.id === answer.selectedChoiceId);
    if (!selected) return { success: false, error: "Invalid choice" };
    isCorrect = evaluateQuestionAnswer(quizQuestion, answer).isCorrect;
    insertRow = {
      user_id: user.id,
      question_id: questionId,
      choice_id: answer.selectedChoiceId,
      is_correct: isCorrect,
      quiz_attempt_id: attemptId,
      answer_payload: buildSingleBestAnswerPayload(answer.selectedChoiceId),
    };
  } else if (isImageStimulusQuestion(quizQuestion)) {
    if (answer.type !== "image_stimulus") {
      return { success: false, error: "This question expects an image-stimulus multiple-choice answer" };
    }
    const selected = quizQuestion.choices.find((c) => c.id === answer.selectedChoiceId);
    if (!selected) return { success: false, error: "Invalid choice" };
    isCorrect = evaluateQuestionAnswer(quizQuestion, answer).isCorrect;
    insertRow = {
      user_id: user.id,
      question_id: questionId,
      choice_id: answer.selectedChoiceId,
      is_correct: isCorrect,
      quiz_attempt_id: attemptId,
      answer_payload: buildImageStimulusPayload(answer.selectedChoiceId),
    };
  } else if (isTrueFalseQuestion(quizQuestion)) {
    if (answer.type !== "true_false") {
      return { success: false, error: "This question expects a true/false answer" };
    }
    isCorrect = evaluateQuestionAnswer(quizQuestion, answer).isCorrect;
    insertRow = {
      user_id: user.id,
      question_id: questionId,
      choice_id: null,
      is_correct: isCorrect,
      quiz_attempt_id: attemptId,
      answer_payload: buildTrueFalsePayload(answer.value),
    };
  } else if (isMultiSelectQuestion(quizQuestion)) {
    if (answer.type !== "multi_select") {
      return { success: false, error: "This question expects a multi-select answer" };
    }
    for (const id of answer.selectedChoiceIds) {
      if (!quizQuestion.choices.some((c) => c.id === id)) {
        return { success: false, error: "Invalid choice" };
      }
    }
    isCorrect = evaluateQuestionAnswer(quizQuestion, answer).isCorrect;
    insertRow = {
      user_id: user.id,
      question_id: questionId,
      choice_id: null,
      is_correct: isCorrect,
      quiz_attempt_id: attemptId,
      answer_payload: buildMultiSelectPayload(answer.selectedChoiceIds),
    };
  } else {
    return { success: false, error: "Unsupported question type" };
  }

  const { error: delErr } = await supabase
    .from("question_responses")
    .delete()
    .eq("quiz_attempt_id", attemptId)
    .eq("question_id", questionId)
    .eq("user_id", user.id);

  if (delErr) {
    console.error("saveAnswerToAttempt delete:", delErr);
    return { success: false, error: "Could not save answer" };
  }

  const { error: insErr } = await supabase.from("question_responses").insert(insertRow);

  if (insErr) {
    console.error("saveAnswerToAttempt error:", insErr);
    return { success: false, error: "Could not save answer" };
  }

  return { success: true };
}

export async function submitQuizAttempt(
  attemptId: string,
): Promise<ActionResult<{ attemptId: string; scoreCorrect: number; scoreTotal: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("id, quiz_id, status")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!attempt) return { success: false, error: "Attempt not found" };
  if (attempt.status !== "in_progress") {
    return { success: false, error: "Attempt already submitted" };
  }

  const { data: items } = await supabase.from("quiz_items").select("question_id").eq("quiz_id", attempt.quiz_id);

  const totalQuestions = items?.length ?? 0;

  const { data: responses } = await supabase
    .from("question_responses")
    .select("is_correct")
    .eq("quiz_attempt_id", attemptId)
    .eq("user_id", user.id);

  const correctCount = (responses ?? []).filter((r) => r.is_correct).length;

  const { error: updErr } = await supabase
    .from("quiz_attempts")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      score_correct: correctCount,
      score_total: totalQuestions,
    })
    .eq("id", attemptId)
    .eq("user_id", user.id);

  if (updErr) {
    console.error("submitQuizAttempt error:", updErr);
    return { success: false, error: "Could not submit attempt" };
  }

  revalidatePath("/quiz-bank");
  revalidatePath("/quiz-bank/my-quizzes");

  return {
    success: true,
    data: {
      attemptId,
      scoreCorrect: correctCount,
      scoreTotal: totalQuestions,
    },
  };
}

export async function abandonQuizAttempt(attemptId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("quiz_attempts")
    .update({
      status: "abandoned",
      abandoned_at: new Date().toISOString(),
    })
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .eq("status", "in_progress");

  if (error) {
    console.error("abandonQuizAttempt error:", error);
    return { success: false, error: "Could not abandon attempt" };
  }

  return { success: true };
}
