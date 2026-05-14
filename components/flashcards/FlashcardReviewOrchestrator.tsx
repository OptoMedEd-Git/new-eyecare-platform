"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Inbox, Loader2, Square } from "lucide-react";

import { fetchNextFlashcard } from "@/app/(app)/flashcards/actions";
import { PracticeFilters } from "@/components/quiz-bank/PracticeFilters";
import type { Flashcard, FlashcardAudience, FlashcardDifficulty, FlashcardRating, ReviewFilters } from "@/lib/flashcards/types";

import { FlashcardReviewCard } from "./FlashcardReviewCard";

type SessionEntry = { flashcard: Flashcard; rating: FlashcardRating | null };

type ReviewPhase = "front" | "back_pending" | "back_rated" | "readonly";

type Props = {
  categoryOptions: { id: string; name: string; count: number }[];
  initialFlaggedFlashcardIds: string[];
};

export function FlashcardReviewOrchestrator({ categoryOptions, initialFlaggedFlashcardIds }: Props) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);

  const [entries, setEntries] = useState<SessionEntry[]>([]);
  const [cursor, setCursor] = useState(0);
  const [reviewPhase, setReviewPhase] = useState<ReviewPhase>("front");

  const [isLoading, setIsLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [sessionGood, setSessionGood] = useState(0);
  const [sessionHard, setSessionHard] = useState(0);
  const [sessionAgain, setSessionAgain] = useState(0);

  const [flaggedIds, setFlaggedIds] = useState(() => new Set(initialFlaggedFlashcardIds));

  const filters: ReviewFilters = useMemo(
    () => ({
      categoryIds: selectedCategoryIds,
      audiences: selectedAudiences as FlashcardAudience[],
      difficulties: selectedDifficulties as FlashcardDifficulty[],
    }),
    [selectedCategoryIds, selectedAudiences, selectedDifficulties],
  );

  const loadFirstCard = useCallback(async () => {
    setIsLoading(true);
    setEmpty(false);
    setSessionEnded(false);
    try {
      const card = await fetchNextFlashcard(filters);
      if (!card) {
        setEntries([]);
        setEmpty(true);
      } else {
        setEntries([{ flashcard: card, rating: null }]);
        setCursor(0);
        setReviewPhase("front");
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadFirstCard();
    });
  }, [loadFirstCard]);

  const tailIndex = entries.length > 0 ? entries.length - 1 : -1;
  const readOnly = tailIndex >= 0 && cursor < tailIndex;
  const currentEntry = tailIndex >= 0 ? entries[cursor] : null;

  const hideExternalNext =
    !readOnly && tailIndex >= 0 && cursor === tailIndex && reviewPhase === "back_rated";

  function handleRated(rating: FlashcardRating) {
    setSessionReviewed((s) => s + 1);
    if (rating === "good") setSessionGood((s) => s + 1);
    else if (rating === "hard") setSessionHard((s) => s + 1);
    else setSessionAgain((s) => s + 1);

    setEntries((prev) => {
      const next = [...prev];
      if (next[cursor]) next[cursor] = { ...next[cursor], rating };
      return next;
    });
  }

  async function handleInternalNext() {
    const card = await fetchNextFlashcard(filters);
    if (!card) {
      setEmpty(true);
      return;
    }
    setEntries((prev) => [...prev, { flashcard: card, rating: null }]);
    setCursor((c) => c + 1);
    setReviewPhase("front");
  }

  async function handleExternalNext() {
    if (tailIndex < 0) return;
    if (cursor < tailIndex) {
      setCursor((c) => c + 1);
      return;
    }
    if (reviewPhase === "back_rated") return;
    if (reviewPhase === "front") {
      const card = await fetchNextFlashcard(filters);
      if (!card) {
        setEmpty(true);
        return;
      }
      setEntries((prev) => {
        const next = [...prev];
        next[next.length - 1] = { flashcard: card, rating: null };
        return next;
      });
      setReviewPhase("front");
    }
  }

  function handlePrevious() {
    if (cursor <= 0) return;
    setCursor((c) => c - 1);
  }

  function handleFlaggedChange(flashcardId: string, flagged: boolean) {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (flagged) next.add(flashcardId);
      else next.delete(flashcardId);
      return next;
    });
  }

  function handleEndSession() {
    setSessionEnded(true);
  }

  async function handleStartNewSession() {
    setSessionEnded(false);
    setSessionReviewed(0);
    setSessionGood(0);
    setSessionHard(0);
    setSessionAgain(0);
    await loadFirstCard();
  }

  const externalNextDisabled = tailIndex < 0 || (cursor === tailIndex && reviewPhase === "back_pending");

  return (
    <div className="space-y-4">
      {!sessionEnded && sessionReviewed > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-base border border-border-default bg-bg-primary-soft px-4 py-3 text-sm shadow-xs">
          <span className="font-medium text-text-heading">This session</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-text-body">
            <span>{sessionReviewed} reviewed</span>
            <span className="text-text-fg-success-strong">{sessionGood} knew well</span>
            <span className="text-text-fg-warning-strong">{sessionHard} kind of</span>
            <span className="text-text-fg-danger">{sessionAgain} didn&apos;t know</span>
          </div>
        </div>
      ) : null}

      {!sessionEnded ? (
        <PracticeFilters
          categoryOptions={categoryOptions}
          selectedCategoryIds={selectedCategoryIds}
          onCategoriesChange={setSelectedCategoryIds}
          selectedAudiences={selectedAudiences}
          onAudiencesChange={setSelectedAudiences}
          selectedDifficulties={selectedDifficulties}
          onDifficultiesChange={setSelectedDifficulties}
        />
      ) : null}

      {sessionEnded ? (
        <SessionSummary
          totalReviewed={sessionReviewed}
          knewWell={sessionGood}
          kindOf={sessionHard}
          didntKnow={sessionAgain}
          onStartNew={handleStartNewSession}
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center rounded-base border border-border-default bg-bg-primary-soft p-12 shadow-xs">
          <Loader2 className="size-6 animate-spin text-text-muted" aria-hidden />
        </div>
      ) : empty ? (
        <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
          <Inbox className="mx-auto size-8 text-text-muted" aria-hidden />
          <p className="mt-3 text-base font-medium text-text-heading">No flashcards match these filters</p>
          <p className="mt-1 text-sm text-text-body">Try adjusting or clearing your filters.</p>
        </div>
      ) : currentEntry ? (
        <>
          <FlashcardReviewCard
            key={`${currentEntry.flashcard.id}-${cursor}`}
            flashcard={currentEntry.flashcard}
            readOnly={readOnly}
            readonlyRating={readOnly && currentEntry.rating != null ? currentEntry.rating : null}
            initialFlagged={flaggedIds.has(currentEntry.flashcard.id)}
            onFlaggedChange={handleFlaggedChange}
            onReviewPhaseChange={setReviewPhase}
            onRated={handleRated}
            onNext={handleInternalNext}
          />

          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border-default pt-4">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={cursor <= 0}
              className="inline-flex items-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </button>
            <button
              type="button"
              onClick={handleEndSession}
              className="inline-flex items-center gap-2 rounded-base border border-border-default bg-bg-secondary-soft px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-bg-primary-soft"
            >
              <Square className="size-4" aria-hidden />
              End session
            </button>
            {!hideExternalNext ? (
              <button
                type="button"
                onClick={() => void handleExternalNext()}
                disabled={externalNextDisabled}
                className="inline-flex items-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function SessionSummary({
  totalReviewed,
  knewWell,
  kindOf,
  didntKnow,
  onStartNew,
}: {
  totalReviewed: number;
  knewWell: number;
  kindOf: number;
  didntKnow: number;
  onStartNew: () => void;
}) {
  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-md">
      <h2 className="text-center text-xl font-semibold text-text-heading">Session complete</h2>
      <p className="mt-2 text-center text-base text-text-body">
        You reviewed {totalReviewed} of {totalReviewed} cards
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-base border border-border-success-subtle bg-bg-success-softer px-4 py-5 text-center">
          <p className="text-2xl font-bold tabular-nums text-text-fg-success-strong">{knewWell}</p>
          <p className="mt-1 text-sm font-medium text-text-heading">Knew well</p>
        </div>
        <div className="rounded-base border border-border-warning-subtle bg-bg-warning-softer px-4 py-5 text-center">
          <p className="text-2xl font-bold tabular-nums text-text-fg-warning-strong">{kindOf}</p>
          <p className="mt-1 text-sm font-medium text-text-heading">Kind of</p>
        </div>
        <div className="rounded-base border border-border-danger-subtle bg-bg-danger-softer px-4 py-5 text-center">
          <p className="text-2xl font-bold tabular-nums text-text-fg-danger">{didntKnow}</p>
          <p className="mt-1 text-sm font-medium text-text-heading">Didn&apos;t know</p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/flashcards"
          className="inline-flex w-full items-center justify-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-6 py-3 text-sm font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary-soft sm:w-auto"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to flashcards
        </Link>
        <button
          type="button"
          onClick={() => void onStartNew()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-base bg-bg-brand px-6 py-3 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium sm:w-auto"
        >
          Start new session
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
