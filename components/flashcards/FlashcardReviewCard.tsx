"use client";

import { useState, useTransition } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowRight, Check, Loader2, X } from "lucide-react";

import { submitFlashcardReview } from "@/app/(app)/flashcards/actions";
import type { Flashcard, FlashcardRating } from "@/lib/flashcards/types";

type CardState = "front" | "back_pending" | "back_rated";

type Props = {
  flashcard: Flashcard;
  onNext: () => void;
  onRated: (rating: FlashcardRating) => void;
};

export function FlashcardReviewCard({ flashcard, onNext, onRated }: Props) {
  const [state, setState] = useState<CardState>("front");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasImage = Boolean(flashcard.imageUrl?.trim());

  function handleFlip() {
    setState("back_pending");
  }

  function handleRate(rating: FlashcardRating) {
    if (state !== "back_pending" || isPending) return;
    setError(null);

    startTransition(async () => {
      const result = await submitFlashcardReview(flashcard.id, rating);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onRated(rating);
      setState("back_rated");
    });
  }

  return (
    <article
      className={[
        "flex w-full min-h-[400px] flex-col items-stretch justify-between gap-8",
        "rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-md",
      ].join(" ")}
    >
      <div
        className={[
          "flex min-h-0 flex-1 w-full flex-col justify-center",
          hasImage ? "" : "items-center",
        ].join(" ")}
      >
        {hasImage && flashcard.imageUrl ? (
          <ImageCardContent state={state} flashcard={flashcard} imageUrl={flashcard.imageUrl.trim()} />
        ) : (
          <TextOnlyCardContent state={state} flashcard={flashcard} />
        )}
      </div>

      {error ? (
        <div className="w-full rounded-base border border-border-danger bg-bg-danger-softer p-3 text-sm text-text-fg-danger">
          {error}
        </div>
      ) : null}

      <div className="w-full shrink-0">
        {state === "front" ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleFlip}
              className="inline-flex items-center justify-center gap-2 rounded-base bg-bg-brand px-10 py-3 text-base font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
            >
              Flip card
            </button>
          </div>
        ) : null}

        {state === "back_pending" ? (
          <div>
            <p className="mb-3 text-center text-sm font-medium text-text-heading">How well did you know this?</p>
            {isPending ? (
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
        ) : null}

        {state === "back_rated" ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center justify-center gap-2 rounded-base bg-bg-brand px-10 py-3 text-base font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
            >
              Next card
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TextOnlyCardContent({ state, flashcard }: { state: CardState; flashcard: Flashcard }) {
  if (state === "front") {
    return (
      <div className="max-w-2xl text-center">
        <p className="text-xl font-semibold leading-relaxed text-text-heading whitespace-pre-wrap">{flashcard.front}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl text-center">
      <p className="text-lg leading-relaxed text-text-body whitespace-pre-wrap">{flashcard.back}</p>
      <MetadataRow flashcard={flashcard} />
    </div>
  );
}

function ImageCardContent({
  state,
  flashcard,
  imageUrl,
}: {
  state: CardState;
  flashcard: Flashcard;
  imageUrl: string;
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:items-stretch sm:gap-8">
      <div className="order-2 flex flex-col justify-center sm:order-1 sm:text-left">
        {state === "front" ? (
          <p className="text-center text-lg font-medium leading-relaxed text-text-heading whitespace-pre-wrap sm:text-left">
            {flashcard.front}
          </p>
        ) : (
          <>
            <p className="text-center text-base leading-relaxed text-text-body whitespace-pre-wrap sm:text-left">
              {flashcard.back}
            </p>
            <MetadataRow flashcard={flashcard} alignLeft />
          </>
        )}
      </div>

      <div className="order-1 flex flex-col gap-2 sm:order-2">
        <div className="flex items-center justify-center rounded-base bg-bg-secondary-soft p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote URLs may not match next/image patterns */}
          <img src={imageUrl} alt="" className="max-h-64 max-w-full object-contain" />
        </div>
        {flashcard.imageAttribution ? (
          <p className="text-right text-xs italic text-text-muted">{flashcard.imageAttribution}</p>
        ) : null}
      </div>
    </div>
  );
}

function MetadataRow({ flashcard, alignLeft = false }: { flashcard: Flashcard; alignLeft?: boolean }) {
  return (
    <div
      className={[
        "mt-6 flex flex-wrap items-center gap-2 text-xs text-text-muted",
        alignLeft ? "justify-start" : "justify-center",
      ].join(" ")}
    >
      {flashcard.category ? (
        <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 font-medium text-text-fg-brand-strong">
          {flashcard.category.name}
        </span>
      ) : null}
      <span className="font-medium capitalize">{flashcard.difficulty}</span>
      {flashcard.audience ? (
        <>
          <span aria-hidden>·</span>
          <span className="font-medium capitalize">
            {flashcard.audience === "all" ? "All clinicians" : flashcard.audience}
          </span>
        </>
      ) : null}
    </div>
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
      className={[
        "inline-flex flex-col items-center gap-1 rounded-base border px-3 py-3 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        colorClass,
      ].join(" ")}
    >
      <Icon className="size-5" aria-hidden />
      {label}
    </button>
  );
}
