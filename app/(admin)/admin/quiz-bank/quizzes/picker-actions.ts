"use server";

import { getAvailableQuestionsForPicker } from "@/lib/quiz-bank/admin-queries";

export async function fetchAvailableQuestions(
  excludeQuizId: string | null,
  filters: {
    search?: string;
    categoryIds?: string[];
    audiences?: string[];
    difficulties?: string[];
  } = {},
) {
  return getAvailableQuestionsForPicker(excludeQuizId, filters);
}
