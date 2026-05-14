"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Inbox, Loader2, X } from "lucide-react";

import { fetchNextFlashcard } from "@/app/(app)/flashcards/actions";
import { PracticeFilters } from "@/components/quiz-bank/PracticeFilters";
import type { Flashcard, FlashcardAudience, FlashcardDifficulty, FlashcardRating, ReviewFilters } from "@/lib/flashcards/types";

import { FlashcardReviewCard } from "./FlashcardReviewCard";

type SessionEntry = {
  flashcard: Flashcard;
  rating: FlashcardRating | null;
  wasFlipped: boolean;
};

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

  const [isLoading, setIsLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const [flaggedIds, setFlaggedIds] = useState(() => new Set(initialFlaggedFlashcardIds));

  const filters: ReviewFilters = useMemo(
    () => ({
      categoryIds: selectedCategoryIds,
      audiences: selectedAudiences as FlashcardAudience[],
      difficulties: selectedDifficulties as FlashcardDifficulty[],
    }),
    [selectedCategoryIds, selectedAudiences, selectedDifficulties],
  );

  const sessionStats = useMemo(() => {
    let good = 0;
    let hard = 0;
    let again = 0;
    let rated = 0;
    for (const e of entries) {
      if (e.rating == null) continue;
      rated += 1;
      if (e.rating === "good") good += 1;
      else if (e.rating === "hard") hard += 1;
      else if (e.rating === "again") again += 1;
    }
    return { rated, good, hard, again };
  }, [entries]);

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
        setEntries([{ flashcard: card, rating: null, wasFlipped: false }]);
        setCursor(0);
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

  function handleCardFlipped() {
    setEntries((prev) =>
      prev.map((e, i) => (i === cursor ? { ...e, wasFlipped: true } : e)),
    );
  }

  function handleRated(rating: FlashcardRating) {
    setEntries((prev) => {
      const next = [...prev];
      if (next[cursor]) next[cursor] = { ...next[cursor], rating };
      return next;
    });
  }

  async function handleExternalNext() {
    if (tailIndex < 0) return;
    if (cursor < tailIndex) {
      setCursor((c) => c + 1);
      return;
    }
    const card = await fetchNextFlashcard(filters);
    if (!card) {
      setEmpty(true);
      return;
    }
    setEntries((prev) => [...prev, { flashcard: card, rating: null, wasFlipped: false }]);
    setCursor((c) => c + 1);
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
    await loadFirstCard();
  }

  const cardInitialState = currentEntry?.wasFlipped ? "back" : "front";

  return (
    <div className="space-y-4">
      {!sessionEnded && sessionStats.rated > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-base border border-border-default bg-bg-primary-soft px-4 py-3 text-sm shadow-xs">
          <span className="font-medium text-text-heading">This session</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-text-body">
            <span>{sessionStats.rated} rated</span>
            <span className="text-text-fg-success-strong">{sessionStats.good} knew well</span>
            <span className="text-text-fg-warning-strong">{sessionStats.hard} kind of</span>
            <span className="text-text-fg-danger">{sessionStats.again} didn&apos;t know</span>
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
        <SessionSummary entries={entries} onStartNew={handleStartNewSession} />
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
        <div className="w-full space-y-0">
          <FlashcardReviewCard
            key={`${currentEntry.flashcard.id}-${cursor}`}
            flashcard={currentEntry.flashcard}
            initialState={cardInitialState}
            currentRating={currentEntry.rating}
            readOnly={readOnly}
            initialFlagged={flaggedIds.has(currentEntry.flashcard.id)}
            onFlaggedChange={handleFlaggedChange}
            onFlipped={readOnly ? undefined : handleCardFlipped}
            onRated={handleRated}
          />

          <div className="mt-6 grid w-full grid-cols-3 items-center gap-3 border-t border-border-default pt-4">
            <div className="justify-self-start">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={cursor <= 0}
                className="inline-flex items-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-3 text-sm font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </button>
            </div>
            <div className="justify-self-center">
              <button
                type="button"
                onClick={handleEndSession}
                className="inline-flex items-center gap-1.5 rounded-base bg-bg-danger px-4 py-3 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-danger-medium"
              >
                <X className="size-4" aria-hidden />
                End session
              </button>
            </div>
            <div className="justify-self-end">
              <button
                type="button"
                onClick={() => void handleExternalNext()}
                disabled={tailIndex < 0}
                className="inline-flex items-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-3 text-sm font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SessionSummary({
  entries,
  onStartNew,
}: {
  entries: SessionEntry[];
  onStartNew: () => void;
}) {
  const n = entries.length;
  const ratedCount = entries.filter((c) => c.rating !== null).length;
  const unratedCount = n - ratedCount;
  const goodCount = entries.filter((c) => c.rating === "good").length;
  const hardCount = entries.filter((c) => c.rating === "hard").length;
  const againCount = entries.filter((c) => c.rating === "again").length;

  const bodySentence =
    n === 0
      ? "No cards in this session."
      : `You went through ${n} ${n === 1 ? "card" : "cards"}` +
        (unratedCount > 0 ? ` (${ratedCount} rated, ${unratedCount} skipped)` : ratedCount > 0 ? ", all rated" : "") +
        ".";

  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-md">
      <h2 className="text-center text-xl font-semibold text-text-heading">Session complete</h2>
      <p className="mt-2 text-center text-base text-text-body">{bodySentence}</p>

      {ratedCount > 0 ? (
        <div className="mx-auto mt-6 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-base border border-border-success-subtle bg-bg-success-softer px-4 py-5 text-center">
            <p className="text-2xl font-bold tabular-nums text-text-fg-success-strong">{goodCount}</p>
            <p className="mt-1 text-sm font-medium text-text-heading">Knew well</p>
          </div>
          <div className="rounded-base border border-border-warning-subtle bg-bg-warning-softer px-4 py-5 text-center">
            <p className="text-2xl font-bold tabular-nums text-text-fg-warning-strong">{hardCount}</p>
            <p className="mt-1 text-sm font-medium text-text-heading">Kind of</p>
          </div>
          <div className="rounded-base border border-border-danger-subtle bg-bg-danger-softer px-4 py-5 text-center">
            <p className="text-2xl font-bold tabular-nums text-text-fg-danger">{againCount}</p>
            <p className="mt-1 text-sm font-medium text-text-heading">Didn&apos;t know</p>
          </div>
        </div>
      ) : null}

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
