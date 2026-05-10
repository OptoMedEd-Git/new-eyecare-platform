"use client";

import { useMemo, useState } from "react";

import type { QuizAttemptResult } from "@/lib/quiz-bank/queries";
import type { QuizAttempt } from "@/lib/quiz-bank/types";

import { PastAttemptsSection } from "./PastAttemptsSection";
import { QuizResultQuestionCard } from "./QuizResultQuestionCard";
import { QuizResultsFilterToggle, type ResultsFilter } from "./QuizResultsFilterToggle";
import { QuizResultsHero } from "./QuizResultsHero";
import { RetakeQuizCard } from "./RetakeQuizCard";

type Props = {
  result: QuizAttemptResult;
  pastAttempts: QuizAttempt[];
  quizSlug: string;
};

export function QuizResultsView({ result, pastAttempts, quizSlug }: Props) {
  const [filter, setFilter] = useState<ResultsFilter>("all");

  const filteredQuestions = useMemo(() => {
    if (filter === "incorrect") {
      return result.questions.filter((q) => q.isCorrect === false || q.isCorrect === null);
    }
    if (filter === "flagged") {
      return result.questions;
    }
    return result.questions;
  }, [result.questions, filter]);

  const incorrectCount = useMemo(
    () => result.questions.filter((q) => q.isCorrect !== true).length,
    [result.questions],
  );

  const questionOrder = useMemo(() => {
    const map = new Map<string, number>();
    result.questions.forEach((entry, i) => {
      map.set(entry.question.id, i + 1);
    });
    return map;
  }, [result.questions]);

  return (
    <div className="space-y-6">
      <QuizResultsHero result={result} />

      <PastAttemptsSection
        pastAttempts={pastAttempts}
        currentAttemptId={result.attempt.id}
        quizSlug={quizSlug}
      />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-text-heading">Question review</h2>
          <QuizResultsFilterToggle
            value={filter}
            onChange={setFilter}
            allCount={result.questions.length}
            incorrectCount={incorrectCount}
          />
        </div>

        <div className="mt-4 space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
              <p className="text-base font-medium text-text-heading">
                {filter === "incorrect"
                  ? "No incorrect answers — well done."
                  : "No questions to display."}
              </p>
              {filter === "incorrect" ? (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="mt-2 text-sm text-text-fg-brand-strong hover:underline"
                >
                  Show all questions
                </button>
              ) : null}
            </div>
          ) : (
            filteredQuestions.map((entry) => (
              <QuizResultQuestionCard
                key={entry.question.id}
                entry={entry}
                questionNumber={questionOrder.get(entry.question.id) ?? 0}
              />
            ))
          )}
        </div>
      </section>

      <RetakeQuizCard quiz={result.quiz} />
    </div>
  );
}
