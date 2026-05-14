"use client";

import { searchFlashcardDecksAction } from "@/app/(admin)/admin/pathways/picker-actions";

import { ContentPicker } from "./ContentPicker";

type Props = {
  pathwayId: string;
  onAdded: () => void;
};

export function FlashcardDeckPicker({ pathwayId, onAdded }: Props) {
  return (
    <ContentPicker
      pathwayId={pathwayId}
      searchAction={searchFlashcardDecksAction}
      moduleType="flashcard_deck"
      placeholder="Search published flashcard decks…"
      onAdded={onAdded}
    />
  );
}
