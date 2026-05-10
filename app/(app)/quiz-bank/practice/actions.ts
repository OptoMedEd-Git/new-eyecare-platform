"use server";

import { getRandomPracticeQuestion } from "@/lib/quiz-bank/queries";
import type { PracticeFilters, PracticeQuestionResult } from "@/lib/quiz-bank/types";

export async function fetchNextQuestion(filters: PracticeFilters): Promise<PracticeQuestionResult | null> {
  return getRandomPracticeQuestion(filters);
}
