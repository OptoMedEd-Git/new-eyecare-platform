"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const DIFFICULTIES = ["foundational", "intermediate", "advanced"] as const;
const AUDIENCES = ["student", "resident", "practicing", "all"] as const;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseCategoryId(formData: FormData): string | null {
  const raw = String(formData.get("category_id") ?? "").trim();
  if (!raw) return null;
  if (!isUuid(raw)) return null;
  return raw;
}

function parseAudience(formData: FormData): (typeof AUDIENCES)[number] | null {
  const raw = String(formData.get("target_audience") ?? "").trim();
  if (!raw) return null;
  return AUDIENCES.includes(raw as (typeof AUDIENCES)[number]) ? (raw as (typeof AUDIENCES)[number]) : null;
}

function parseDifficulty(formData: FormData): (typeof DIFFICULTIES)[number] {
  const raw = String(formData.get("difficulty") ?? "intermediate").trim();
  return DIFFICULTIES.includes(raw as (typeof DIFFICULTIES)[number])
    ? (raw as (typeof DIFFICULTIES)[number])
    : "intermediate";
}

function extractImageFields(formData: FormData) {
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const imageAttribution = String(formData.get("image_attribution") ?? "").trim();
  return {
    image_url: imageUrl || null,
    image_attribution: imageAttribution || null,
  };
}

function validateFlashcard(formData: FormData): string | null {
  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();
  if (!front) return "Front text is required";
  if (!back) return "Back text is required";
  if (front.length > 500) return "Front text is too long (max 500 characters)";
  if (back.length > 1000) return "Back text is too long (max 1000 characters)";

  const imageUrl = String(formData.get("image_url") ?? "").trim();
  if (imageUrl && !/^(https?:\/\/|\/)/.test(imageUrl)) {
    return "Image URL must be a valid HTTP(S) URL or relative path";
  }

  const imageAttribution = String(formData.get("image_attribution") ?? "").trim();
  if (imageAttribution.length > 500) {
    return "Image attribution is too long (max 500 characters)";
  }

  return null;
}

function revalidateFlashcardSurfaces() {
  revalidatePath("/admin/flashcards");
  revalidatePath("/flashcards");
  revalidatePath("/flashcards/review");
}

export async function createFlashcard(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const err = validateFlashcard(formData);
  if (err) return { success: false, error: err };

  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();
  const categoryId = parseCategoryId(formData);
  const targetAudience = parseAudience(formData);
  const difficulty = parseDifficulty(formData);

  const { data, error } = await supabase
    .from("flashcards")
    .insert({
      front,
      back,
      category_id: categoryId,
      target_audience: targetAudience,
      difficulty,
      status: "draft",
      author_id: user.id,
      ...extractImageFields(formData),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createFlashcard error:", error);
    return { success: false, error: "Could not create flashcard" };
  }

  revalidatePath("/admin/flashcards");
  return { success: true, data: { id: data.id } };
}

export async function updateFlashcard(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const err = validateFlashcard(formData);
  if (err) return { success: false, error: err };

  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();
  const categoryId = parseCategoryId(formData);
  const targetAudience = parseAudience(formData);
  const difficulty = parseDifficulty(formData);

  const { error } = await supabase
    .from("flashcards")
    .update({
      front,
      back,
      category_id: categoryId,
      target_audience: targetAudience,
      difficulty,
      ...extractImageFields(formData),
    })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not update flashcard" };

  revalidateFlashcardSurfaces();
  revalidatePath(`/admin/flashcards/${id}/edit`);
  return { success: true };
}

export async function publishFlashcard(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("flashcards")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not publish" };

  revalidateFlashcardSurfaces();
  revalidatePath(`/admin/flashcards/${id}/edit`);
  return { success: true };
}

export async function publishFlashcardWithChanges(id: string, formData: FormData): Promise<ActionResult> {
  const u = await updateFlashcard(id, formData);
  if (!u.success) return u;
  return publishFlashcard(id);
}

export async function unpublishFlashcard(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("flashcards")
    .update({ status: "draft", published_at: null })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not unpublish" };

  revalidateFlashcardSurfaces();
  revalidatePath(`/admin/flashcards/${id}/edit`);
  return { success: true };
}

export async function deleteFlashcard(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("flashcards").delete().eq("id", id).eq("author_id", user.id);

  if (error) return { success: false, error: "Could not delete" };

  revalidateFlashcardSurfaces();
  return { success: true };
}
