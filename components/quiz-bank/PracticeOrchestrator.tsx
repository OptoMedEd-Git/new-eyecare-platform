"use client";

import { fetchNextQuestion } from "@/app/(app)/quiz-bank/practice/actions";
import type { PracticeQuestionResult, PracticeStats, QuestionAudience, QuizDifficulty } from "@/lib/quiz-bank/types";
import { ArrowLeft, ArrowRight, Inbox, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PracticeEndButton } from "./PracticeEndButton";
import { PracticeFilters, type PracticeCategoryOption } from "./PracticeFilters";
import type { PracticeReviewSnapshot } from "./PracticeQuestionCard";
import { PracticeQuestionCard } from "./PracticeQuestionCard";

type Props = {
  categoryOptions: PracticeCategoryOption[];
  initialLifetimeStats: PracticeStats;
};

type AnsweredHistoryEntry = {
  result: PracticeQuestionResult;
  snapshot: PracticeReviewSnapshot;
  questionOrdinal: number;
};

const secondaryBarBtn =
  "inline-flex items-center justify-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-40";

export function PracticeOrchestrator({ categoryOptions, initialLifetimeStats }: Props) {
  const router = useRouter();

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<QuestionAudience[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<QuizDifficulty[]>([]);

  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [empty, setEmpty] = useState(false);

  const [lifetime, setLifetime] = useState(initialLifetimeStats);

  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const [answeredHistory, setAnsweredHistory] = useState<AnsweredHistoryEntry[]>([]);
  const [reviewCursor, setReviewCursor] = useState<number | null>(null);
  const [questionOrdinal, setQuestionOrdinal] = useState(0);
  const [liveResumeSnapshot, setLiveResumeSnapshot] = useState<PracticeReviewSnapshot | null>(null);

  const currentQuestionRef = useRef(currentQuestion);
  const questionOrdinalRef = useRef(questionOrdinal);
  const reviewCursorRef = useRef(reviewCursor);
  currentQuestionRef.current = currentQuestion;
  questionOrdinalRef.current = questionOrdinal;
  reviewCursorRef.current = reviewCursor;

  useEffect(() => {
    // Reset session navigation when filters change, then fetch a new question.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional full reset before reload
    setAnsweredHistory([]);
    setReviewCursor(null);
    setQuestionOrdinal(0);
    setLiveResumeSnapshot(null);
    void loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload full pool when filters change
  }, [selectedCategoryIds, selectedAudiences, selectedDifficulties]);

  async function loadNext() {
    setIsLoading(true);
    setEmpty(false);
    setLiveResumeSnapshot(null);
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
        setReviewCursor(null);
        setQuestionOrdinal((o) => o + 1);
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
        s.totalUniqueQuestionsAnswered + (currentQuestionRef.current?.previouslyAnswered ? 0 : 1),
    }));
  }

  function handleAnswerRecorded(snapshot: PracticeReviewSnapshot) {
    if (reviewCursorRef.current !== null) return;
    const cq = currentQuestionRef.current;
    if (!cq) return;
    const ord = questionOrdinalRef.current;
    setAnsweredHistory((h) => [...h, { result: cq, snapshot, questionOrdinal: ord }]);
  }

  const lifetimeAccuracy = lifetime.totalAnswered > 0 ? Math.round((lifetime.totalCorrect / lifetime.totalAnswered) * 100) : 0;
  const sessionAccuracy =
    sessionAnswered > 0 ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0;

  function handleEndPractice() {
    router.push("/quiz-bank");
  }

  function resolvePreviousTarget(): number | "live" | null {
    if (answeredHistory.length === 0) return null;
    if (reviewCursor !== null) {
      if (reviewCursor > 0) return reviewCursor - 1;
      return "live";
    }
    const curId = currentQuestion?.question.id;
    if (!curId) return null;
    const tail = answeredHistory[answeredHistory.length - 1];
    if (tail.result.question.id !== curId) {
      return answeredHistory.length - 1;
    }
    if (answeredHistory.length < 2) return null;
    return answeredHistory.length - 2;
  }

  function handlePrevious() {
    const t = resolvePreviousTarget();
    if (t === null) return;
    if (t === "live") {
      const tail = answeredHistory[answeredHistory.length - 1];
      if (tail && currentQuestion && tail.result.question.id === currentQuestion.question.id) {
        setLiveResumeSnapshot(tail.snapshot);
      }
      setReviewCursor(null);
    } else {
      setReviewCursor(t);
    }
  }

  function handleBarNext() {
    if (reviewCursor !== null) {
      if (reviewCursor < answeredHistory.length - 1) {
        setReviewCursor(reviewCursor + 1);
      } else {
        const tail = answeredHistory[answeredHistory.length - 1];
        if (tail && currentQuestion && tail.result.question.id === currentQuestion.question.id) {
          setLiveResumeSnapshot(tail.snapshot);
        }
        setReviewCursor(null);
      }
      return;
    }
    void loadNext();
  }

  const previousDisabled = resolvePreviousTarget() === null;
  const displayOrdinal =
    reviewCursor !== null && answeredHistory[reviewCursor]
      ? answeredHistory[reviewCursor].questionOrdinal
      : questionOrdinal;

  const reviewEntry = reviewCursor !== null ? answeredHistory[reviewCursor] : null;
  const liveReviewProp: PracticeReviewSnapshot | null =
    (reviewEntry?.snapshot ?? liveResumeSnapshot) ?? null;

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
        <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft">
          {reviewEntry ? (
            <PracticeQuestionCard
              key={`review-${reviewCursor}-${reviewEntry.result.question.id}`}
              result={reviewEntry.result}
              questionOrdinal={displayOrdinal}
              reviewSnapshot={reviewEntry.snapshot}
              onAnswered={() => {}}
              omitOuterFrame
            />
          ) : (
            <PracticeQuestionCard
              key={`live-${currentQuestion.question.id}-${liveResumeSnapshot ? "resume" : "open"}`}
              result={currentQuestion}
              questionOrdinal={displayOrdinal}
              reviewSnapshot={liveReviewProp}
              onAnswered={handleAnswered}
              onAnswerRecorded={liveReviewProp ? undefined : handleAnswerRecorded}
              omitOuterFrame
            />
          )}

          <div className="grid grid-cols-1 gap-3 border-t border-border-default bg-bg-secondary-soft p-4 sm:grid-cols-3 sm:items-center">
            <div className="flex justify-stretch sm:justify-start">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={previousDisabled}
                className={`${secondaryBarBtn} w-full sm:w-auto`}
              >
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                Previous
              </button>
            </div>
            <div className="flex justify-stretch sm:justify-center">
              <PracticeEndButton onClick={handleEndPractice} className="w-full sm:w-auto" />
            </div>
            <div className="flex justify-stretch sm:justify-end">
              <button type="button" onClick={() => void handleBarNext()} className={`${secondaryBarBtn} w-full sm:w-auto`}>
                Next
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
