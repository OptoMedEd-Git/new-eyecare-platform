"use client";

import { useState, useTransition } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowRight, Check, Loader2, X } from "lucide-react";

import { submitFlashcardReview } from "@/app/(app)/flashcards/actions";
import type { Flashcard, FlashcardRating } from "@/lib/flashcards/types";

type Props = {
  flashcard: Flashcard;
  onNext: () => void;
  onRated: (rating: FlashcardRating) => void;
};

export function FlashcardReviewCard({ flashcard, onNext, onRated }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [pendingRating, setPendingRating] = useState<FlashcardRating | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFlip() {
    if (!flipped) setFlipped(true);
  }

  function handleRate(rating: FlashcardRating) {
    if (pendingRating !== null || saveComplete) return;
    setError(null);
    setPendingRating(rating);

    startTransition(async () => {
      const result = await submitFlashcardReview(flashcard.id, rating);
      if (!result.success) {
        setError(result.error);
        setPendingRating(null);
        return;
      }
      onRated(rating);
      setSaveComplete(true);
    });
  }

  return (
    <article className="rounded-base border border-border-default bg-bg-primary-soft shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default p-4">
        <div className="flex flex-wrap items-center gap-2">
          {flashcard.category ? (
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {flashcard.category.name}
            </span>
          ) : null}
          <span className="text-xs font-medium capitalize text-text-muted">{flashcard.difficulty}</span>
          {flashcard.audience ? (
            <>
              <span className="text-text-muted" aria-hidden>
                ·
              </span>
              <span className="text-xs font-medium text-text-muted capitalize">
                {flashcard.audience === "all" ? "All clinicians" : flashcard.audience}
              </span>
            </>
          ) : null}
        </div>
      </header>

      <div className="p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Front</p>
          <p className="mt-2 text-xl leading-relaxed whitespace-pre-wrap text-text-heading">{flashcard.front}</p>
        </div>

        {flipped ? (
          <div className="mt-6 border-t border-border-default pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-text-fg-brand-strong">Back</p>
            <p className="mt-2 text-base leading-relaxed whitespace-pre-wrap text-text-body">{flashcard.back}</p>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="border-t border-border-danger bg-bg-danger-softer p-3 text-sm text-text-fg-danger">{error}</div>
      ) : null}

      <footer className="border-t border-border-default p-5">
        {!flipped ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleFlip}
              className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
            >
              Show answer
            </button>
          </div>
        ) : !saveComplete ? (
          <div>
            <p className="mb-3 text-center text-sm font-medium text-text-heading">How well did you know this?</p>
            {isPending && pendingRating ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-text-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <RatingButton
                  label="Didn't know"
                  icon={X}
                  colorClass="border-border-danger-subtle bg-bg-danger-softer text-text-fg-danger hover:bg-bg-danger-soft"
                  onClick={() => handleRate("again")}
                  disabled={isPending}
                />
                <RatingButton
                  label="Kind of"
                  icon={AlertCircle}
                  colorClass="border-border-warning-subtle bg-bg-warning-softer text-text-fg-warning-strong hover:bg-bg-warning-soft"
                  onClick={() => handleRate("hard")}
                  disabled={isPending}
                />
                <RatingButton
                  label="Knew it well"
                  icon={Check}
                  colorClass="border-border-success-subtle bg-bg-success-softer text-text-fg-success-strong hover:bg-bg-success-soft"
                  onClick={() => handleRate("good")}
                  disabled={isPending}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
            >
              Next card
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </footer>
    </article>
  );
}

function RatingButton({
  label,
  icon: Icon,
  colorClass,
  onClick,
  disabled,
}: {
  label: string;
  icon: LucideIcon;
  colorClass: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex flex-col items-center gap-1 rounded-base border px-3 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${colorClass}`}
    >
      <Icon className="size-5" aria-hidden />
      {label}
    </button>
  );
}
