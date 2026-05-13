"use client";

import { useEffect, useState } from "react";
import { Inbox, Loader2 } from "lucide-react";

import { fetchNextFlashcard } from "@/app/(app)/flashcards/actions";
import { PracticeFilters } from "@/components/quiz-bank/PracticeFilters";
import type { Flashcard, FlashcardAudience, FlashcardDifficulty, ReviewFilters } from "@/lib/flashcards/types";

import { FlashcardReviewCard } from "./FlashcardReviewCard";

type Props = {
  categoryOptions: { id: string; name: string; count: number }[];
};

export function FlashcardReviewOrchestrator({ categoryOptions }: Props) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);

  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [empty, setEmpty] = useState(false);

  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [sessionGood, setSessionGood] = useState(0);
  const [sessionHard, setSessionHard] = useState(0);
  const [sessionAgain, setSessionAgain] = useState(0);

  const filters: ReviewFilters = {
    categoryIds: selectedCategoryIds,
    audiences: selectedAudiences as FlashcardAudience[],
    difficulties: selectedDifficulties as FlashcardDifficulty[],
  };

  useEffect(() => {
    void loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filter selection changes
  }, [selectedCategoryIds, selectedAudiences, selectedDifficulties]);

  async function loadNext() {
    setIsLoading(true);
    setEmpty(false);
    try {
      const card = await fetchNextFlashcard(filters);
      if (!card) {
        setCurrentCard(null);
        setEmpty(true);
      } else {
        setCurrentCard(card);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleRated(rating: "again" | "hard" | "good") {
    setSessionReviewed((s) => s + 1);
    if (rating === "good") setSessionGood((s) => s + 1);
    else if (rating === "hard") setSessionHard((s) => s + 1);
    else setSessionAgain((s) => s + 1);
  }

  return (
    <div className="space-y-4">
      {sessionReviewed > 0 ? (
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

      <PracticeFilters
        categoryOptions={categoryOptions}
        selectedCategoryIds={selectedCategoryIds}
        onCategoriesChange={setSelectedCategoryIds}
        selectedAudiences={selectedAudiences}
        onAudiencesChange={setSelectedAudiences}
        selectedDifficulties={selectedDifficulties}
        onDifficultiesChange={setSelectedDifficulties}
      />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-base border border-border-default bg-bg-primary-soft p-12 shadow-xs">
          <Loader2 className="size-6 animate-spin text-text-muted" aria-hidden />
        </div>
      ) : empty ? (
        <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
          <Inbox className="mx-auto size-8 text-text-muted" aria-hidden />
          <p className="mt-3 text-base font-medium text-text-heading">No flashcards match these filters</p>
          <p className="mt-1 text-sm text-text-body">Try adjusting or clearing your filters.</p>
        </div>
      ) : currentCard ? (
        <FlashcardReviewCard
          key={currentCard.id}
          flashcard={currentCard}
          onRated={handleRated}
          onNext={loadNext}
        />
      ) : null}
    </div>
  );
}
