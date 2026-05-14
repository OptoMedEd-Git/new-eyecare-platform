"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { success: false; error: string };

export async function flagFlashcard(flashcardId: string, note?: string | null): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: card } = await supabase
    .from("flashcards")
    .select("id, status, author_id")
    .eq("id", flashcardId)
    .single();

  if (!card) return { success: false, error: "Flashcard not found" };
  if (card.status !== "published" && card.author_id !== user.id) {
    return { success: false, error: "Cannot flag this flashcard" };
  }

  const { error } = await supabase.from("flagged_flashcards").upsert(
    {
      user_id: user.id,
      flashcard_id: flashcardId,
      note: note ?? null,
    },
    { onConflict: "user_id,flashcard_id", ignoreDuplicates: false },
  );

  if (error) {
    console.error("flagFlashcard error:", error);
    return { success: false, error: "Could not flag flashcard" };
  }

  revalidatePath("/flashcards/review");
  return { success: true };
}

export async function unflagFlashcard(flashcardId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("flagged_flashcards")
    .delete()
    .eq("user_id", user.id)
    .eq("flashcard_id", flashcardId);

  if (error) {
    console.error("unflagFlashcard error:", error);
    return { success: false, error: "Could not unflag flashcard" };
  }

  revalidatePath("/flashcards/review");
  return { success: true };
}
