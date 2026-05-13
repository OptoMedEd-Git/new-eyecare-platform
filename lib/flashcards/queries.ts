import { createClient } from "@/lib/supabase/server";

import type {
  Flashcard,
  FlashcardAudience,
  FlashcardDifficulty,
  FlashcardReviewStats,
  FlashcardStatus,
  ReviewFilters,
} from "./types";

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function rowToFlashcard(row: Record<string, unknown>): Flashcard {
  const cat = single(row.category as { id: string; name: string } | { id: string; name: string }[] | null);
  return {
    id: String(row.id),
    front: String(row.front),
    back: String(row.back),
    imageUrl: row.image_url == null || row.image_url === "" ? null : String(row.image_url),
    imageAttribution:
      row.image_attribution == null || row.image_attribution === "" ? null : String(row.image_attribution),
    category: cat,
    audience: (row.target_audience as FlashcardAudience | null) ?? null,
    difficulty: row.difficulty as FlashcardDifficulty,
    status: row.status as FlashcardStatus,
    authorId: row.author_id == null ? null : String(row.author_id),
    publishedAt: row.published_at == null ? null : String(row.published_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function getRandomFlashcard(filters: ReviewFilters): Promise<Flashcard | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("flashcards")
    .select(
      `
      *,
      category:blog_categories(id, name)
    `,
    )
    .eq("status", "published");

  if (filters.categoryIds.length > 0) {
    query = query.in("category_id", filters.categoryIds);
  }
  if (filters.audiences.length > 0) {
    query = query.in("target_audience", filters.audiences);
  }
  if (filters.difficulties.length > 0) {
    query = query.in("difficulty", filters.difficulties);
  }

  const { data: matching, error } = await query;
  if (error || !matching?.length) return null;

  const rows = matching as Record<string, unknown>[];

  let reviewedIds = new Set<string>();
  if (user) {
    const { data: reviews } = await supabase
      .from("flashcard_reviews")
      .select("flashcard_id")
      .eq("user_id", user.id);
    reviewedIds = new Set((reviews ?? []).map((r) => String((r as { flashcard_id: string }).flashcard_id)));
  }

  const unreviewed = rows.filter((c) => !reviewedIds.has(String(c.id)));
  const pool = unreviewed.length > 0 ? unreviewed : rows;

  const picked = pool[Math.floor(Math.random() * pool.length)] as Record<string, unknown>;
  return rowToFlashcard(picked);
}

export async function getFlashcardReviewStats(): Promise<FlashcardReviewStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: totalCardsPublished } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const published = totalCardsPublished ?? 0;

  if (!user) {
    return {
      totalReviews: 0,
      uniqueCardsReviewed: 0,
      totalCardsPublished: published,
      lastRatingDistribution: { again: 0, hard: 0, good: 0 },
    };
  }

  const { data: reviews } = await supabase
    .from("flashcard_reviews")
    .select("flashcard_id, rating, reviewed_at")
    .eq("user_id", user.id)
    .order("reviewed_at", { ascending: false });

  if (!reviews?.length) {
    return {
      totalReviews: 0,
      uniqueCardsReviewed: 0,
      totalCardsPublished: published,
      lastRatingDistribution: { again: 0, hard: 0, good: 0 },
    };
  }

  const lastByCard = new Map<string, string>();
  for (const r of reviews) {
    const row = r as { flashcard_id: string; rating: string };
    if (!lastByCard.has(row.flashcard_id)) {
      lastByCard.set(row.flashcard_id, row.rating);
    }
  }

  const distribution = { again: 0, hard: 0, good: 0 };
  for (const rating of lastByCard.values()) {
    if (rating === "again") distribution.again += 1;
    else if (rating === "hard") distribution.hard += 1;
    else if (rating === "good") distribution.good += 1;
  }

  return {
    totalReviews: reviews.length,
    uniqueCardsReviewed: lastByCard.size,
    totalCardsPublished: published,
    lastRatingDistribution: distribution,
  };
}

export async function getActiveFlashcardCategories(): Promise<{ id: string; name: string; count: number }[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards")
    .select(
      `
      category_id,
      category:blog_categories(id, name)
    `,
    )
    .eq("status", "published")
    .not("category_id", "is", null);

  if (error || !data) return [];

  const counts = new Map<string, { name: string; count: number }>();
  for (const raw of data as Array<{ category_id?: string | null; category?: unknown }>) {
    const cat = single(raw.category as { id: string; name: string } | { id: string; name: string }[] | null);
    if (!cat?.id) continue;
    const cur = counts.get(cat.id);
    counts.set(cat.id, {
      name: cat.name,
      count: (cur?.count ?? 0) + 1,
    });
  }

  return Array.from(counts.entries())
    .map(([id, v]) => ({ id, name: v.name, count: v.count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
