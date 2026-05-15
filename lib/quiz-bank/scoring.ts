import type { QuestionEvaluationResult, QuizQuestion, SubmittedQuestionAnswer } from "./types";

function evaluation(allCorrect: boolean): QuestionEvaluationResult {
  return { isCorrect: allCorrect, scoreRatio: allCorrect ? 1 : 0 };
}

function setEquals(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) {
    if (!b.has(x)) return false;
  }
  return true;
}

/**
 * Type-aware scoring for a submitted answer. Returns a structured result so future partial-credit
 * modes can set fractional `scoreRatio` and optional `partialCredit` without changing this function's shape.
 */
export function evaluateQuestionAnswer(
  question: QuizQuestion,
  answer: SubmittedQuestionAnswer,
): QuestionEvaluationResult {
  switch (question.questionType) {
    case "single_best_answer": {
      if (answer.type !== "single_best_answer") return { isCorrect: false, scoreRatio: 0 };
      const choice = question.choices.find((c) => c.id === answer.selectedChoiceId);
      const ok = choice?.isCorrect ?? false;
      return evaluation(ok);
    }
    case "image_stimulus": {
      if (answer.type !== "image_stimulus") return { isCorrect: false, scoreRatio: 0 };
      const choice = question.choices.find((c) => c.id === answer.selectedChoiceId);
      const ok = choice?.isCorrect ?? false;
      return evaluation(ok);
    }
    case "true_false": {
      if (answer.type !== "true_false") return { isCorrect: false, scoreRatio: 0 };
      const ok = answer.value === question.correctAnswer;
      return evaluation(ok);
    }
    case "multi_select": {
      if (answer.type !== "multi_select") return { isCorrect: false, scoreRatio: 0 };
      const validIds = new Set(question.choices.map((c) => c.id));
      for (const id of answer.selectedChoiceIds) {
        if (!validIds.has(id)) return { isCorrect: false, scoreRatio: 0 };
      }
      const correctSet = new Set(question.choices.filter((c) => c.isCorrect).map((c) => c.id));
      const selectedSet = new Set(answer.selectedChoiceIds);
      const ok = setEquals(correctSet, selectedSet);
      return evaluation(ok);
    }
    default:
      return { isCorrect: false, scoreRatio: 0 };
  }
}
