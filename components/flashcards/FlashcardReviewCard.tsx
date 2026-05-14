"use client";

import { useState, useTransition } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Check, Loader2, X } from "lucide-react";

import { flagFlashcard, unflagFlashcard } from "@/app/(app)/flashcards/flag-actions";
import { submitFlashcardReview } from "@/app/(app)/flashcards/actions";
import { FlagButton } from "@/components/shared/FlagButton";
import type { Flashcard, FlashcardRating } from "@/lib/flashcards/types";

type CardState = "front" | "back";

type Props = {
  flashcard: Flashcard;
  initialState: CardState;
  currentRating: FlashcardRating | null;
  initialFlagged: boolean;
  readOnly?: boolean;
  onFlipped?: () => void;
  onRated: (rating: FlashcardRating) => void;
  onFlaggedChange?: (flashcardId: string, flagged: boolean) => void;
};

export function FlashcardReviewCard({
  flashcard,
  initialState,
  currentRating,
  initialFlagged,
  readOnly = false,
  onFlipped,
  onRated,
  onFlaggedChange,
}: Props) {
  const [state, setState] = useState<CardState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasImage = Boolean(flashcard.imageUrl?.trim());
  const showBack = state === "back";

  function handleFlip() {
    if (readOnly) return;
    setState("back");
    onFlipped?.();
  }

  function handleRate(rating: FlashcardRating) {
    if (readOnly || state !== "back") return;
    setError(null);
    onRated(rating);

    startTransition(async () => {
      const result = await submitFlashcardReview(flashcard.id, rating);
      if (!result.success) {
        setError(result.error);
      }
    });
  }

  const flagEl = (
    <FlagButton
      initialFlagged={initialFlagged}
      variant="icon"
      onToggle={(now) => onFlaggedChange?.(flashcard.id, now)}
      flag={() => flagFlashcard(flashcard.id).then((r) => (r.success ? { success: true } : { success: false, error: r.error }))}
      unflag={() => unflagFlashcard(flashcard.id).then((r) => (r.success ? { success: true } : { success: false, error: r.error }))}
    />
  );

  return (
    <article
      className={[
        "flex w-full min-h-[400px] flex-col items-stretch justify-between gap-6",
        "rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-md",
      ].join(" ")}
    >
      <header className="flex min-h-[28px] w-full items-center gap-3">
        {showBack ? (
          <>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-2 text-xs text-text-muted">
              <MetadataPills flashcard={flashcard} />
            </div>
            <div className="shrink-0">{flagEl}</div>
          </>
        ) : (
          <div className="ml-auto shrink-0">{flagEl}</div>
        )}
      </header>

      <div className={["flex min-h-0 flex-1 w-full flex-col gap-6", hasImage ? "" : "items-center"].join(" ")}>
        {hasImage && flashcard.imageUrl ? (
          <LiveImageBody state={state} flashcard={flashcard} imageUrl={flashcard.imageUrl.trim()} />
        ) : (
          <LiveTextBody state={state} flashcard={flashcard} />
        )}
      </div>

      {error ? (
        <div className="w-full rounded-base border border-border-danger bg-bg-danger-softer p-3 text-sm text-text-fg-danger">
          {error}
        </div>
      ) : null}

      <div className="w-full shrink-0">
        {state === "front" && !readOnly ? (
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

        {showBack ? (
          <div>
            <p className="mb-3 text-center text-sm font-medium text-text-heading">How well did you know this?</p>
            {isPending ? (
              <p className="mb-2 text-center text-xs text-text-muted">
                <Loader2 className="inline size-3.5 animate-spin align-middle" aria-hidden /> Saving…
              </p>
            ) : null}
            <div className="grid grid-cols-3 gap-2">
              <RatingButton
                label="Didn't know"
                icon={X}
                rating="again"
                selected={currentRating === "again"}
                onClick={() => handleRate("again")}
                disabled={isPending || readOnly}
              />
              <RatingButton
                label="Kind of"
                icon={AlertCircle}
                rating="hard"
                selected={currentRating === "hard"}
                onClick={() => handleRate("hard")}
                disabled={isPending || readOnly}
              />
              <RatingButton
                label="Knew it well"
                icon={Check}
                rating="good"
                selected={currentRating === "good"}
                onClick={() => handleRate("good")}
                disabled={isPending || readOnly}
              />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function MetadataPills({ flashcard }: { flashcard: Flashcard }) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-2 text-xs text-text-muted">
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

function LiveTextBody({ state, flashcard }: { state: CardState; flashcard: Flashcard }) {
  if (state === "front") {
    return (
      <div className="flex w-full max-w-2xl flex-1 flex-col justify-center text-center">
        <p className="text-xl font-semibold leading-relaxed text-text-heading whitespace-pre-wrap">{flashcard.front}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-1 flex-col justify-center text-center">
      <p className="text-lg leading-relaxed text-text-body whitespace-pre-wrap">{flashcard.back}</p>
    </div>
  );
}

function LiveImageBody({
  state,
  flashcard,
  imageUrl,
}: {
  state: CardState;
  flashcard: Flashcard;
  imageUrl: string;
}) {
  return (
    <div className="grid w-full flex-1 grid-cols-1 gap-6 sm:grid-cols-2 sm:items-stretch sm:gap-8">
      <div className="order-2 flex flex-col justify-center gap-4 sm:order-1 sm:text-left">
        {state === "front" ? (
          <p className="text-center text-lg font-medium leading-relaxed text-text-heading whitespace-pre-wrap sm:text-left">
            {flashcard.front}
          </p>
        ) : (
          <p className="text-center text-base leading-relaxed text-text-body whitespace-pre-wrap sm:text-left">
            {flashcard.back}
          </p>
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

/** Faint tinted rest state + stronger selected; ring-ring-* for emphasis (no extra check glyph). */
const RATING_STYLES: Record<FlashcardRating, { base: string; selected: string }> = {
  again: {
    base: "border-border-danger-subtle bg-bg-danger-softer text-text-fg-danger hover:bg-bg-danger-soft",
    selected:
      "border-border-danger bg-bg-danger-soft text-text-fg-danger ring-2 ring-ring-danger ring-offset-2 ring-offset-bg-primary-soft",
  },
  hard: {
    base: "border-border-warning-subtle bg-bg-warning-softer text-text-fg-warning-strong hover:bg-bg-warning-soft",
    selected:
      "border-border-warning bg-bg-warning-soft text-text-fg-warning-strong ring-2 ring-ring-warning ring-offset-2 ring-offset-bg-primary-soft",
  },
  good: {
    base: "border-border-success-subtle bg-bg-success-softer text-text-fg-success-strong hover:bg-bg-success-soft",
    selected:
      "border-border-success bg-bg-success-soft text-text-fg-success-strong ring-2 ring-ring-success ring-offset-2 ring-offset-bg-primary-soft",
  },
};

function RatingButton({
  label,
  icon: Icon,
  rating,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  icon: LucideIcon;
  rating: FlashcardRating;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const variant = selected ? RATING_STYLES[rating].selected : RATING_STYLES[rating].base;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        "inline-flex h-10 min-h-10 w-full flex-row items-center justify-center gap-1.5 rounded-base border px-2 text-xs font-medium transition-all sm:text-sm",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant,
      ].join(" ")}
    >
      <Icon className="size-4 shrink-0 sm:size-[18px]" aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  );
}
