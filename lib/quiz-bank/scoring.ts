import type { QuizQuestion, SubmittedQuestionAnswer } from "./types";

/**
 * Type-aware correctness for a submitted answer. Add branches per `question_type`
 * (and matching payload shapes in answer-payload).
 */
export function evaluateQuestionAnswer(question: QuizQuestion, answer: SubmittedQuestionAnswer): boolean {
  switch (question.questionType) {
    case "single_best_answer": {
      if (answer.type !== "single_best_answer") return false;
      const choice = question.choices.find((c) => c.id === answer.selectedChoiceId);
      return choice?.isCorrect ?? false;
    }
    case "true_false": {
      if (answer.type !== "true_false") return false;
      return answer.value === question.correctAnswer;
    }
    default:
      return false;
  }
}
