"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";

import { FlashcardReviewCard } from "@/components/flashcards/FlashcardReviewCard";
import type { DeckWithCards, Flashcard, FlashcardRating } from "@/lib/flashcards/types";

type SessionEntry = {
  flashcard: Flashcard;
  rating: FlashcardRating | null;
  wasFlipped: boolean;
};

type Props = {
  deck: DeckWithCards;
  initialFlaggedFlashcardIds: string[];
};

export function DeckReviewOrchestrator({ deck, initialFlaggedFlashcardIds }: Props) {
  const first = deck.cards[0];

  const [entries, setEntries] = useState<SessionEntry[]>(() =>
    first ? [{ flashcard: first, rating: null, wasFlipped: false }] : [],
  );
  const [cursor, setCursor] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [flaggedIds, setFlaggedIds] = useState(() => new Set(initialFlaggedFlashcardIds));

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

  const tailIndex = entries.length > 0 ? entries.length - 1 : -1;
  const readOnly = tailIndex >= 0 && cursor < tailIndex;
  const currentEntry = tailIndex >= 0 ? entries[cursor] : null;

  function handleCardFlipped() {
    setEntries((prev) => prev.map((e, i) => (i === cursor ? { ...e, wasFlipped: true } : e)));
  }

  function handleRated(rating: FlashcardRating) {
    setEntries((prev) => {
      const next = [...prev];
      if (next[cursor]) next[cursor] = { ...next[cursor], rating };
      return next;
    });
  }

  function handleExternalNext() {
    if (tailIndex < 0) return;
    if (cursor < tailIndex) {
      setCursor((c) => c + 1);
      return;
    }
    if (entries.length < deck.cards.length) {
      const nextCard = deck.cards[entries.length];
      setEntries((prev) => [...prev, { flashcard: nextCard, rating: null, wasFlipped: false }]);
      setCursor((c) => c + 1);
      return;
    }
    setSessionEnded(true);
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

  function handleRestartDeck() {
    const f = deck.cards[0];
    if (!f) return;
    setSessionEnded(false);
    setEntries([{ flashcard: f, rating: null, wasFlipped: false }]);
    setCursor(0);
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

      {sessionEnded ? (
        <DeckSessionSummary
          deckSlug={deck.slug}
          deckTitle={deck.title}
          totalCards={deck.cards.length}
          entries={entries}
          onRestart={handleRestartDeck}
        />
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
                onClick={handleExternalNext}
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

function DeckSessionSummary({
  deckSlug,
  deckTitle,
  totalCards,
  entries,
  onRestart,
}: {
  deckSlug: string;
  deckTitle: string;
  totalCards: number;
  entries: SessionEntry[];
  onRestart: () => void;
}) {
  const n = entries.length;
  const ratedCount = entries.filter((c) => c.rating !== null).length;
  const unratedCount = n - ratedCount;
  const goodCount = entries.filter((c) => c.rating === "good").length;
  const hardCount = entries.filter((c) => c.rating === "hard").length;
  const againCount = entries.filter((c) => c.rating === "again").length;

  const reachedEnd = n === totalCards && totalCards > 0;

  let bodySentence: string;
  if (reachedEnd) {
    bodySentence = `You finished the deck — all ${totalCards} ${totalCards === 1 ? "card" : "cards"} in order. You rated ${ratedCount} of them.`;
    if (unratedCount > 0) {
      bodySentence += ` ${unratedCount} ${unratedCount === 1 ? "was" : "were"} skipped without a rating.`;
    }
  } else if (n === 0) {
    bodySentence = "No cards in this session.";
  } else {
    bodySentence =
      `You went through ${n} ${n === 1 ? "card" : "cards"}` +
      (unratedCount > 0 ? ` (${ratedCount} rated, ${unratedCount} skipped)` : ratedCount > 0 ? ", all rated" : "") +
      ".";
  }

  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-md">
      <h2 className="text-center text-xl font-semibold text-text-heading">
        {reachedEnd ? "Deck complete" : "Session complete"}
      </h2>
      <p className="mt-2 text-center text-base text-text-body">
        <span className="font-medium text-text-heading">{deckTitle}</span>
      </p>
      <p className="mt-1 text-center text-base text-text-body">{bodySentence}</p>

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
          href={`/flashcards/decks/${deckSlug}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-6 py-3 text-sm font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary-soft sm:w-auto"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to deck overview
        </Link>
        {totalCards > 0 ? (
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-base bg-bg-brand px-6 py-3 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium sm:w-auto"
          >
            Restart deck
            <ArrowRight className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
