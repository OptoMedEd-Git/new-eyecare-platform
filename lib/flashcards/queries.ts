import { createClient } from "@/lib/supabase/server";

import type {
  DeckListing,
  DeckWithCards,
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

export function rowToFlashcard(row: Record<string, unknown>): Flashcard {
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

/** IDs of flashcards the current user has flagged (requires `flagged_flashcards` table). */
export async function getFlaggedFlashcardIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from("flagged_flashcards").select("flashcard_id").eq("user_id", user.id);

  if (error || !data) return [];
  return data.map((r) => String((r as { flashcard_id: string }).flashcard_id));
}

export async function isFlashcardFlagged(flashcardId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("flagged_flashcards")
    .select("id")
    .eq("user_id", user.id)
    .eq("flashcard_id", flashcardId)
    .maybeSingle();

  return data != null;
}

export type FlaggedFlashcardEntry = {
  flashcard: Flashcard;
  flaggedAt: string;
  note: string | null;
};

/**
 * All flagged flashcards for the current user with full card data. Newest-flagged first.
 */
export async function getFlaggedFlashcardsForUser(): Promise<FlaggedFlashcardEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("flagged_flashcards")
    .select(
      `
      flagged_at,
      note,
      flashcard:flashcards(
        *,
        category:blog_categories(id, name)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("flagged_at", { ascending: false });

  if (error || !data) return [];

  const out: FlaggedFlashcardEntry[] = [];

  for (const row of data as Array<{
    flagged_at: string;
    note: string | null;
    flashcard: Record<string, unknown> | Record<string, unknown>[] | null;
  }>) {
    const fRaw = row.flashcard;
    const f = Array.isArray(fRaw) ? fRaw[0] : fRaw;
    if (!f || typeof f !== "object") continue;
    out.push({
      flashcard: rowToFlashcard(f),
      flaggedAt: row.flagged_at,
      note: row.note,
    });
  }

  return out;
}

/** Count of flagged flashcards for the current user (cheap head request). */
export async function getFlaggedFlashcardCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("flagged_flashcards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) return 0;
  return count ?? 0;
}

export type RecentFlaggedFlashcardItem = {
  flashcardId: string;
  front: string;
  category: { id: string; name: string } | null;
  flaggedAt: string;
};

/** Last N flagged flashcards for landing previews. */
export async function getRecentFlaggedFlashcards(limit: number = 3): Promise<RecentFlaggedFlashcardItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("flagged_flashcards")
    .select(
      `
      flagged_at,
      flashcard:flashcards(
        id,
        front,
        category:blog_categories(id, name)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("flagged_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  const out: RecentFlaggedFlashcardItem[] = [];

  for (const row of data as Array<{
    flagged_at: string;
    flashcard: Record<string, unknown> | Record<string, unknown>[] | null;
  }>) {
    const fRaw = row.flashcard;
    const f = Array.isArray(fRaw) ? fRaw[0] : fRaw;
    if (!f || typeof f !== "object") continue;
    const fr = f as Record<string, unknown>;
    const cat = single(fr.category as { id: string; name: string } | { id: string; name: string }[] | null);
    out.push({
      flashcardId: String(fr.id),
      front: String(fr.front),
      category: cat,
      flaggedAt: row.flagged_at,
    });
  }

  return out;
}

function mapDeckRowToListing(
  row: Record<string, unknown>,
  cardCount: number,
): DeckListing {
  const cat = single(row.category as { id: string; name: string } | { id: string; name: string }[] | null);
  const status = row.status === "published" ? "published" : "draft";
  const diff = row.difficulty as FlashcardDifficulty | null;
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: row.description == null ? null : String(row.description),
    category: cat,
    audience: (row.target_audience as FlashcardAudience | null) ?? null,
    difficulty: diff ?? null,
    isFeatured: Boolean(row.is_featured),
    status,
    authorId: row.author_id == null ? null : String(row.author_id),
    publishedAt: row.published_at == null ? null : String(row.published_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    cardCount,
  };
}

export async function getPublishedDecks(): Promise<DeckListing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcard_decks")
    .select(
      `
      *,
      category:blog_categories(id, name),
      flashcard_deck_items(count)
    `,
    )
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  return (data as Record<string, unknown>[]).map((row) => {
    const embed = row.flashcard_deck_items as { count: number }[] | null | undefined;
    const countEl = Array.isArray(embed) ? embed[0] : null;
    const cardCount = countEl?.count ?? 0;
    return mapDeckRowToListing(row, cardCount);
  });
}

export async function getPublishedDeckBySlug(slug: string): Promise<DeckWithCards | null> {
  const supabase = await createClient();

  const { data: deckRow, error } = await supabase
    .from("flashcard_decks")
    .select(
      `
      *,
      category:blog_categories(id, name)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !deckRow) return null;

  const dr = deckRow as Record<string, unknown>;

  const { data: itemsData, error: itemsErr } = await supabase
    .from("flashcard_deck_items")
    .select(
      `
      position,
      flashcard:flashcards(
        *,
        category:blog_categories(id, name)
      )
    `,
    )
    .eq("deck_id", dr.id as string)
    .order("position", { ascending: true });

  if (itemsErr) return null;

  const cards: Flashcard[] = [];
  for (const item of itemsData ?? []) {
    const it = item as Record<string, unknown>;
    const fRaw = it.flashcard;
    const f = Array.isArray(fRaw) ? fRaw[0] : fRaw;
    if (!f || typeof f !== "object") continue;
    cards.push(rowToFlashcard(f as Record<string, unknown>));
  }

  const listing = mapDeckRowToListing(dr, cards.length);
  return { ...listing, cards };
}

/**
 * Next random card from a published deck (prefers cards the user has not reviewed yet).
 * Deck review UI uses linear order instead; this is available for future flows.
 */
export async function getNextCardFromDeck(deckSlug: string): Promise<Flashcard | null> {
  const deck = await getPublishedDeckBySlug(deckSlug);
  if (!deck || deck.cards.length === 0) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let reviewedIds = new Set<string>();
  if (user) {
    const { data: reviews } = await supabase
      .from("flashcard_reviews")
      .select("flashcard_id")
      .eq("user_id", user.id);
    reviewedIds = new Set((reviews ?? []).map((r) => String((r as { flashcard_id: string }).flashcard_id)));
  }

  const unreviewed = deck.cards.filter((c) => !reviewedIds.has(c.id));
  const pool = unreviewed.length > 0 ? unreviewed : deck.cards;

  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
