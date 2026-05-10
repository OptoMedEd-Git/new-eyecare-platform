"use client";

import { fetchNextQuestion } from "@/app/(app)/quiz-bank/practice/actions";
import type { PracticeQuestionResult, PracticeStats, QuestionAudience, QuizDifficulty } from "@/lib/quiz-bank/types";
import { Inbox, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PracticeFilters, type PracticeCategoryOption } from "./PracticeFilters";
import { PracticeQuestionCard } from "./PracticeQuestionCard";

type Props = {
  categoryOptions: PracticeCategoryOption[];
  initialLifetimeStats: PracticeStats;
};

export function PracticeOrchestrator({ categoryOptions, initialLifetimeStats }: Props) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<QuestionAudience[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<QuizDifficulty[]>([]);

  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [empty, setEmpty] = useState(false);

  const [lifetime, setLifetime] = useState(initialLifetimeStats);

  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  useEffect(() => {
    void loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload full pool when filters change
  }, [selectedCategoryIds, selectedAudiences, selectedDifficulties]);

  async function loadNext() {
    setIsLoading(true);
    setEmpty(false);
    try {
      const result = await fetchNextQuestion({
        categoryIds: selectedCategoryIds,
        audiences: selectedAudiences,
        difficulties: selectedDifficulties,
      });
      if (!result) {
        setCurrentQuestion(null);
        setEmpty(true);
      } else {
        setCurrentQuestion(result);
      }
    } catch (e) {
      console.error("Failed to load question:", e);
      setCurrentQuestion(null);
      setEmpty(true);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAnswered(wasCorrect: boolean) {
    setSessionAnswered((s) => s + 1);
    if (wasCorrect) setSessionCorrect((s) => s + 1);
    setLifetime((s) => ({
      totalAnswered: s.totalAnswered + 1,
      totalCorrect: s.totalCorrect + (wasCorrect ? 1 : 0),
      totalUniqueQuestionsAnswered:
        s.totalUniqueQuestionsAnswered + (currentQuestion?.previouslyAnswered ? 0 : 1),
    }));
  }

  const lifetimeAccuracy = lifetime.totalAnswered > 0 ? Math.round((lifetime.totalCorrect / lifetime.totalAnswered) * 100) : 0;
  const sessionAccuracy =
    sessionAnswered > 0 ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-base border border-border-default bg-bg-primary-soft px-4 py-3 text-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-medium text-text-heading">Lifetime</span>
          <span className="text-text-body">
            {lifetime.totalAnswered} answered · {lifetime.totalCorrect} correct
            {lifetime.totalAnswered > 0 ? ` (${lifetimeAccuracy}%)` : ""}
          </span>
        </div>
        {sessionAnswered > 0 ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-medium text-text-heading">This session</span>
            <span className="text-text-body">
              {sessionAnswered} answered · {sessionCorrect} correct ({sessionAccuracy}%)
            </span>
          </div>
        ) : null}
      </div>

      <PracticeFilters
        categoryOptions={categoryOptions}
        selectedCategoryIds={selectedCategoryIds}
        onCategoriesChange={setSelectedCategoryIds}
        selectedAudiences={selectedAudiences}
        onAudiencesChange={(ids) => setSelectedAudiences(ids as QuestionAudience[])}
        selectedDifficulties={selectedDifficulties}
        onDifficultiesChange={(ids) => setSelectedDifficulties(ids as QuizDifficulty[])}
      />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-base border border-border-default bg-bg-primary-soft p-12">
          <Loader2 className="size-6 animate-spin text-text-muted" aria-hidden />
        </div>
      ) : empty ? (
        <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
          <Inbox className="mx-auto size-8 text-text-muted" aria-hidden />
          <p className="mt-3 text-base font-medium text-text-heading">No questions match these filters</p>
          <p className="mt-1 text-sm text-text-body">Try adjusting or clearing your filters.</p>
        </div>
      ) : currentQuestion ? (
        <PracticeQuestionCard
          key={currentQuestion.question.id}
          result={currentQuestion}
          onAnswered={handleAnswered}
          onNext={loadNext}
        />
      ) : null}
    </div>
  );
}
