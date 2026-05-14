"use client";

import { searchFlashcardDecksAction } from "@/app/(admin)/admin/pathways/picker-actions";

import { ContentPicker } from "./ContentPicker";

type Props = {
  phaseId: string;
  onAdded: () => void;
};

export function FlashcardDeckPicker({ phaseId, onAdded }: Props) {
  return (
    <ContentPicker
      phaseId={phaseId}
      searchAction={searchFlashcardDecksAction}
      moduleType="flashcard_deck"
      placeholder="Search published flashcard decks…"
      onAdded={onAdded}
    />
  );
}
