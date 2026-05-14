"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { buildSingleBestAnswerPayload, buildTrueFalsePayload } from "@/lib/quiz-bank/answer-payload";
import { evaluateQuestionAnswer } from "@/lib/quiz-bank/scoring";
import { rowToQuizQuestion } from "@/lib/quiz-bank/queries";
import { isSingleBestAnswerQuestion, isTrueFalseQuestion, type SubmittedQuestionAnswer } from "@/lib/quiz-bank/types";

type SubmitResult =
  | { success: false; error: string }
  | {
      success: true;
      isCorrect: boolean;
      explanation: string;
      questionType: "single_best_answer";
      correctChoiceId: string;
    }
  | {
      success: true;
      isCorrect: boolean;
      explanation: string;
      questionType: "true_false";
      correctAnswer: boolean;
    };

export async function submitQuestionResponse(
  questionId: string,
  answer: SubmittedQuestionAnswer,
): Promise<SubmitResult> {
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
      choices:quiz_question_choices(id, position, text, is_correct, question_id),
      true_false:quiz_question_true_false(question_id, correct_answer)
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
  const explanation = String(row.explanation);

  if (isSingleBestAnswerQuestion(quizQuestion)) {
    if (answer.type !== "single_best_answer") {
      return { success: false, error: "This question expects a multiple-choice answer" };
    }
    const selected = quizQuestion.choices.find((c) => c.id === answer.selectedChoiceId);
    if (!selected) return { success: false, error: "Invalid choice" };

    const correctChoice = quizQuestion.choices.find((c) => c.isCorrect);
    if (!correctChoice) return { success: false, error: "Question has no correct answer set" };

    const isCorrect = evaluateQuestionAnswer(quizQuestion, answer);

    const { error: insErr } = await supabase.from("question_responses").insert({
      user_id: user.id,
      question_id: questionId,
      choice_id: answer.selectedChoiceId,
      is_correct: isCorrect,
      answer_payload: buildSingleBestAnswerPayload(answer.selectedChoiceId),
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
      explanation,
      questionType: "single_best_answer",
    };
  }

  if (isTrueFalseQuestion(quizQuestion)) {
    if (answer.type !== "true_false") {
      return { success: false, error: "This question expects a true/false answer" };
    }

    const isCorrect = evaluateQuestionAnswer(quizQuestion, answer);

    const { error: insErr } = await supabase.from("question_responses").insert({
      user_id: user.id,
      question_id: questionId,
      choice_id: null,
      is_correct: isCorrect,
      answer_payload: buildTrueFalsePayload(answer.value),
    });

    if (insErr) {
      console.error("Failed to save response:", insErr);
    }

    revalidatePath("/quiz-bank");
    revalidatePath("/quiz-bank/practice");

    return {
      success: true,
      isCorrect,
      correctAnswer: quizQuestion.correctAnswer,
      explanation,
      questionType: "true_false",
    };
  }

  return { success: false, error: "Unsupported question type" };
}
