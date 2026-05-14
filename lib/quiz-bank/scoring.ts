import type { QuizQuestion } from "./types";

/**
 * Type-aware correctness for a submitted answer. Only single_best_answer is implemented;
 * future question types add branches here (and matching payload shapes in answer-payload).
 */
export function evaluateQuestionAnswer(question: QuizQuestion, selectedChoiceId: string): boolean {
  switch (question.questionType) {
    case "single_best_answer": {
      const choice = question.choices.find((c) => c.id === selectedChoiceId);
      return choice?.isCorrect ?? false;
    }
    default:
      return false;
  }
}
