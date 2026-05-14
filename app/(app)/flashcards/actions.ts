"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getRandomFlashcard } from "@/lib/flashcards/queries";
import type { FlashcardRating, ReviewFilters } from "@/lib/flashcards/types";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const RATINGS: FlashcardRating[] = ["again", "hard", "good"];

export async function submitFlashcardReview(flashcardId: string, rating: FlashcardRating): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (!RATINGS.includes(rating)) return { success: false, error: "Invalid rating" };

  const { data: card } = await supabase
    .from("flashcards")
    .select("id, status, author_id")
    .eq("id", flashcardId)
    .maybeSingle();

  if (!card) return { success: false, error: "Flashcard not found" };
  if (card.status !== "published" && card.author_id !== user.id) {
    return { success: false, error: "Cannot review this flashcard" };
  }

  const { error } = await supabase.from("flashcard_reviews").insert({
    user_id: user.id,
    flashcard_id: flashcardId,
    rating,
  });

  if (error) {
    console.error("submitFlashcardReview error:", error);
    return { success: false, error: "Could not save review" };
  }

  revalidatePath("/flashcards");
  revalidatePath("/flashcards/review");
  revalidatePath("/flashcards/decks");
  return { success: true };
}

export async function fetchNextFlashcard(filters: ReviewFilters) {
  return getRandomFlashcard(filters);
}
