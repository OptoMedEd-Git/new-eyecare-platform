"use server";

import { countMatchingQuestions, type QuizBuilderFilters } from "@/lib/quiz-bank/queries";

export async function countMatchingQuestionsAction(filters: QuizBuilderFilters): Promise<number> {
  return countMatchingQuestions(filters);
}
