"use server";

import { revalidatePath } from "next/cache";

import { ensureUniqueSlug, slugify, slugifyShort } from "@/lib/blog/slugify";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const DIFFICULTIES = ["foundational", "intermediate", "advanced"] as const;
const AUDIENCES = ["student", "resident", "practicing", "all"] as const;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseOptionalUuid(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  return isUuid(raw) ? raw : null;
}

function parseDifficulty(formData: FormData): string | null {
  const raw = String(formData.get("difficulty") ?? "").trim();
  if (!raw) return null;
  return DIFFICULTIES.includes(raw as (typeof DIFFICULTIES)[number]) ? raw : null;
}

function parseAudience(formData: FormData): string | null {
  const raw = String(formData.get("target_audience") ?? "").trim();
  if (!raw) return null;
  return AUDIENCES.includes(raw as (typeof AUDIENCES)[number]) ? raw : null;
}

function revalidateDeckPaths(slug?: string | null) {
  revalidatePath("/admin/flashcards/decks");
  revalidatePath("/flashcards/decks");
  if (slug) {
    revalidatePath(`/flashcards/decks/${slug}`);
    revalidatePath(`/flashcards/decks/${slug}/review`);
  }
}

export async function createDeck(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const categoryId = parseOptionalUuid(formData, "category_id");
  const targetAudience = parseAudience(formData);
  const difficulty = parseDifficulty(formData);
  const isFeatured = formData.get("is_featured") === "on";

  if (!title) return { success: false, error: "Title is required" };

  const baseSlug = slugInput ? slugify(slugInput) : slugifyShort(title);
  if (!baseSlug) return { success: false, error: "Could not derive a URL slug from the title" };

  let slug: string;
  try {
    slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const { data } = await supabase.from("flashcard_decks").select("id").eq("slug", s).maybeSingle();
      return !!data;
    });
  } catch {
    return { success: false, error: "Could not allocate a unique slug" };
  }

  const { data, error } = await supabase
    .from("flashcard_decks")
    .insert({
      title,
      slug,
      description,
      category_id: categoryId,
      target_audience: targetAudience,
      difficulty,
      is_featured: isFeatured,
      status: "draft",
      author_id: user.id,
      published_at: null,
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("createDeck error:", error);
    return { success: false, error: "Could not create deck" };
  }

  revalidatePath("/admin/flashcards/decks");
  return { success: true, data: { id: data.id } };
}

export async function updateDeck(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const categoryId = parseOptionalUuid(formData, "category_id");
  const targetAudience = parseAudience(formData);
  const difficulty = parseDifficulty(formData);
  const isFeatured = formData.get("is_featured") === "on";

  if (!title) return { success: false, error: "Title is required" };

  const slugFinal = slugInput ? slugify(slugInput) : slugifyShort(title);
  if (!slugFinal) return { success: false, error: "Slug is required" };

  const { data: dup } = await supabase
    .from("flashcard_decks")
    .select("id")
    .eq("slug", slugFinal)
    .neq("id", id)
    .maybeSingle();

  if (dup) return { success: false, error: "Slug is already in use" };

  const { data: prev } = await supabase.from("flashcard_decks").select("slug").eq("id", id).maybeSingle();

  const { error } = await supabase
    .from("flashcard_decks")
    .update({
      title,
      slug: slugFinal,
      description,
      category_id: categoryId,
      target_audience: targetAudience,
      difficulty,
      is_featured: isFeatured,
    })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    console.error("updateDeck error:", error);
    return { success: false, error: "Could not update deck" };
  }

  revalidateDeckPaths(prev?.slug as string | undefined);
  revalidatePath(`/admin/flashcards/decks/${id}/edit`);
  return { success: true };
}

export async function publishDeck(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: row } = await supabase.from("flashcard_decks").select("slug").eq("id", id).eq("author_id", user.id).maybeSingle();

  const { error } = await supabase
    .from("flashcard_decks")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not publish" };

  revalidateDeckPaths(row?.slug as string | undefined);
  revalidatePath(`/admin/flashcards/decks/${id}/edit`);
  return { success: true };
}

export async function publishDeckWithChanges(id: string, formData: FormData): Promise<ActionResult> {
  const updateResult = await updateDeck(id, formData);
  if (!updateResult.success) return updateResult;
  return publishDeck(id);
}

export async function unpublishDeck(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: row } = await supabase.from("flashcard_decks").select("slug").eq("id", id).eq("author_id", user.id).maybeSingle();

  const { error } = await supabase
    .from("flashcard_decks")
    .update({ status: "draft", published_at: null })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not unpublish" };

  revalidateDeckPaths(row?.slug as string | undefined);
  revalidatePath(`/admin/flashcards/decks/${id}/edit`);
  return { success: true };
}

export async function deleteDeck(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: row } = await supabase.from("flashcard_decks").select("slug").eq("id", id).eq("author_id", user.id).maybeSingle();

  const { error } = await supabase.from("flashcard_decks").delete().eq("id", id).eq("author_id", user.id);

  if (error) return { success: false, error: "Could not delete" };

  revalidateDeckPaths(row?.slug as string | undefined);
  revalidatePath(`/admin/flashcards/decks/${id}/edit`);
  return { success: true };
}

async function compactDeckItemPositions(deckId: string) {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("flashcard_deck_items")
    .select("id")
    .eq("deck_id", deckId)
    .order("position", { ascending: true });

  if (!rows?.length) return;

  for (let i = 0; i < rows.length; i++) {
    await supabase.from("flashcard_deck_items").update({ position: i }).eq("id", (rows[i] as { id: string }).id);
  }
}

export async function addCardToDeck(deckId: string, flashcardId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: deck } = await supabase
    .from("flashcard_decks")
    .select("id, slug")
    .eq("id", deckId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!deck) return { success: false, error: "Unauthorized" };

  const { data: lastItem } = await supabase
    .from("flashcard_deck_items")
    .select("position")
    .eq("deck_id", deckId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastItem?.position ?? -1) + 1;

  const { error } = await supabase.from("flashcard_deck_items").insert({
    deck_id: deckId,
    flashcard_id: flashcardId,
    position: nextPosition,
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "Card already in deck" };
    return { success: false, error: "Could not add card" };
  }

  revalidateDeckPaths(deck.slug);
  revalidatePath(`/admin/flashcards/decks/${deckId}/edit`);
  return { success: true };
}

export async function removeCardFromDeck(deckId: string, flashcardId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: deck } = await supabase
    .from("flashcard_decks")
    .select("id, slug")
    .eq("id", deckId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!deck) return { success: false, error: "Unauthorized" };

  const { error } = await supabase.from("flashcard_deck_items").delete().eq("deck_id", deckId).eq("flashcard_id", flashcardId);

  if (error) return { success: false, error: "Could not remove card" };

  await compactDeckItemPositions(deckId);

  revalidateDeckPaths(deck.slug);
  revalidatePath(`/admin/flashcards/decks/${deckId}/edit`);
  return { success: true };
}

export async function reorderDeckItem(deckId: string, flashcardId: string, direction: -1 | 1): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: deck } = await supabase
    .from("flashcard_decks")
    .select("id, slug")
    .eq("id", deckId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!deck) return { success: false, error: "Unauthorized" };

  const { data: items, error: fetchErr } = await supabase
    .from("flashcard_deck_items")
    .select("id, flashcard_id, position")
    .eq("deck_id", deckId)
    .order("position", { ascending: true });

  if (fetchErr || !items?.length) return { success: false, error: "Could not fetch items" };

  const idx = items.findIndex((i) => i.flashcard_id === flashcardId);
  if (idx === -1) return { success: false, error: "Card not in deck" };

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= items.length) return { success: false, error: "Cannot move further" };

  const current = items[idx];
  const target = items[targetIdx];
  const maxP = items.reduce((m, i) => Math.max(m, i.position), 0);
  const tempPos = maxP + 1;

  let err = (await supabase.from("flashcard_deck_items").update({ position: tempPos }).eq("id", current.id)).error;
  if (err) return { success: false, error: "Reorder step 1 failed" };

  err = (await supabase.from("flashcard_deck_items").update({ position: current.position }).eq("id", target.id)).error;
  if (err) return { success: false, error: "Reorder step 2 failed" };

  err = (await supabase.from("flashcard_deck_items").update({ position: target.position }).eq("id", current.id)).error;
  if (err) return { success: false, error: "Reorder step 3 failed" };

  revalidateDeckPaths(deck.slug);
  revalidatePath(`/admin/flashcards/decks/${deckId}/edit`);
  return { success: true };
}
