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

function parsePositiveInt(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

export async function createQuiz(formData: FormData): Promise<ActionResult<{ id: string }>> {
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
  const timeLimitMin = parsePositiveInt(formData, "time_limit_minutes");
  const timePerQuestionSec = parsePositiveInt(formData, "time_per_question_seconds");
  const isFeatured = formData.get("is_featured") === "on";

  if (!title) return { success: false, error: "Title is required" };

  const baseSlug = slugInput ? slugify(slugInput) : slugifyShort(title);
  if (!baseSlug) return { success: false, error: "Could not derive a URL slug from the title" };

  let slug: string;
  try {
    slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const { data } = await supabase.from("quizzes").select("id").eq("slug", s).maybeSingle();
      return !!data;
    });
  } catch {
    return { success: false, error: "Could not allocate a unique slug" };
  }

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      title,
      slug,
      description,
      kind: "curated",
      category_id: categoryId,
      target_audience: targetAudience,
      difficulty,
      time_limit_minutes: timeLimitMin,
      time_per_question_seconds: timePerQuestionSec,
      is_featured: isFeatured,
      status: "draft",
      author_id: user.id,
      published_at: null,
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("createQuiz error:", error);
    return { success: false, error: "Could not create quiz" };
  }

  revalidatePath("/admin/quiz-bank/quizzes");
  return { success: true, data: { id: data.id } };
}

export async function updateQuiz(id: string, formData: FormData): Promise<ActionResult> {
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
  const timeLimitMin = parsePositiveInt(formData, "time_limit_minutes");
  const timePerQuestionSec = parsePositiveInt(formData, "time_per_question_seconds");
  const isFeatured = formData.get("is_featured") === "on";

  if (!title) return { success: false, error: "Title is required" };

  const slugFinal = slugInput ? slugify(slugInput) : slugifyShort(title);
  if (!slugFinal) return { success: false, error: "Slug is required" };

  const { data: dup } = await supabase
    .from("quizzes")
    .select("id")
    .eq("slug", slugFinal)
    .neq("id", id)
    .maybeSingle();

  if (dup) return { success: false, error: "Slug is already in use" };

  const { error } = await supabase
    .from("quizzes")
    .update({
      title,
      slug: slugFinal,
      description,
      category_id: categoryId,
      target_audience: targetAudience,
      difficulty,
      time_limit_minutes: timeLimitMin,
      time_per_question_seconds: timePerQuestionSec,
      is_featured: isFeatured,
    })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    console.error("updateQuiz error:", error);
    return { success: false, error: "Could not update quiz" };
  }

  revalidatePath("/admin/quiz-bank/quizzes");
  revalidatePath(`/admin/quiz-bank/quizzes/${id}/edit`);
  return { success: true };
}

export async function publishQuiz(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { count, error: cErr } = await supabase
    .from("quiz_items")
    .select("*", { count: "exact", head: true })
    .eq("quiz_id", id);

  if (cErr) return { success: false, error: "Could not validate quiz" };
  if (!count || count === 0) {
    return { success: false, error: "Add at least one question before publishing" };
  }

  const { error } = await supabase
    .from("quizzes")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not publish" };

  revalidatePath("/admin/quiz-bank/quizzes");
  revalidatePath(`/admin/quiz-bank/quizzes/${id}/edit`);
  return { success: true };
}

export async function publishQuizWithChanges(id: string, formData: FormData): Promise<ActionResult> {
  const updateResult = await updateQuiz(id, formData);
  if (!updateResult.success) return updateResult;
  return publishQuiz(id);
}

export async function unpublishQuiz(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("quizzes")
    .update({ status: "draft", published_at: null })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not unpublish" };

  revalidatePath("/admin/quiz-bank/quizzes");
  revalidatePath(`/admin/quiz-bank/quizzes/${id}/edit`);
  return { success: true };
}

export async function deleteQuiz(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("quizzes").delete().eq("id", id).eq("author_id", user.id);

  if (error) return { success: false, error: "Could not delete" };

  revalidatePath("/admin/quiz-bank/quizzes");
  return { success: true };
}

export async function addQuestionToQuiz(quizId: string, questionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id")
    .eq("id", quizId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!quiz) return { success: false, error: "Unauthorized" };

  const { data: lastItem } = await supabase
    .from("quiz_items")
    .select("position")
    .eq("quiz_id", quizId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastItem?.position ?? -1) + 1;

  const { error } = await supabase.from("quiz_items").insert({
    quiz_id: quizId,
    question_id: questionId,
    position: nextPosition,
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "Question already in quiz" };
    return { success: false, error: "Could not add question" };
  }

  revalidatePath(`/admin/quiz-bank/quizzes/${quizId}/edit`);
  return { success: true };
}

export async function removeQuestionFromQuiz(quizId: string, questionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id")
    .eq("id", quizId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!quiz) return { success: false, error: "Unauthorized" };

  const { error } = await supabase.from("quiz_items").delete().eq("quiz_id", quizId).eq("question_id", questionId);

  if (error) return { success: false, error: "Could not remove question" };

  revalidatePath(`/admin/quiz-bank/quizzes/${quizId}/edit`);
  return { success: true };
}

export async function reorderQuizItem(quizId: string, questionId: string, direction: -1 | 1): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id")
    .eq("id", quizId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!quiz) return { success: false, error: "Unauthorized" };

  const { data: items, error: fetchErr } = await supabase
    .from("quiz_items")
    .select("id, question_id, position")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  if (fetchErr || !items?.length) return { success: false, error: "Could not fetch items" };

  const idx = items.findIndex((i) => i.question_id === questionId);
  if (idx === -1) return { success: false, error: "Question not in quiz" };

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= items.length) return { success: false, error: "Cannot move further" };

  const current = items[idx];
  const target = items[targetIdx];
  const maxP = items.reduce((m, i) => Math.max(m, i.position), 0);
  const tempPos = maxP + 1;

  let err = (await supabase.from("quiz_items").update({ position: tempPos }).eq("id", current.id)).error;
  if (err) return { success: false, error: "Reorder step 1 failed" };

  err = (await supabase.from("quiz_items").update({ position: current.position }).eq("id", target.id)).error;
  if (err) return { success: false, error: "Reorder step 2 failed" };

  err = (await supabase.from("quiz_items").update({ position: target.position }).eq("id", current.id)).error;
  if (err) return { success: false, error: "Reorder step 3 failed" };

  revalidatePath(`/admin/quiz-bank/quizzes/${quizId}/edit`);
  return { success: true };
}
