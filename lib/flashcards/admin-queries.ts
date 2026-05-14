import { createClient } from "@/lib/supabase/server";

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export type AdminFlashcardRow = {
  id: string;
  front: string;
  back: string;
  image_url: string | null;
  image_attribution: string | null;
  category_id: string | null;
  category: { id: string; name: string } | null;
  target_audience: string | null;
  difficulty: string;
  status: string;
  author_id: string | null;
  author: { id: string; first_name: string | null; last_name: string | null } | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getAllAdminFlashcards(userId: string): Promise<AdminFlashcardRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!flashcards_author_id_fkey(id, first_name, last_name)
    `,
    )
    .eq("author_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch admin flashcards:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      ...(row as unknown as AdminFlashcardRow),
      category: single(r.category as AdminFlashcardRow["category"]),
      author: single(r.author as AdminFlashcardRow["author"]),
    };
  });
}

export async function getAdminFlashcardById(id: string, userId: string): Promise<AdminFlashcardRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!flashcards_author_id_fkey(id, first_name, last_name)
    `,
    )
    .eq("id", id)
    .eq("author_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch flashcard:", error);
    return null;
  }
  if (!data) return null;

  const r = data as Record<string, unknown>;
  return {
    ...(data as unknown as AdminFlashcardRow),
    category: single(r.category as AdminFlashcardRow["category"]),
    author: single(r.author as AdminFlashcardRow["author"]),
  };
}

export type AdminDeckAuthor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export type AdminDeckRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category_id: string | null;
  category: { id: string; name: string } | null;
  target_audience: string | null;
  difficulty: string | null;
  is_featured: boolean;
  status: string;
  author_id: string | null;
  author: AdminDeckAuthor | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  card_count: number;
};

export type AdminDeckItemRow = {
  id: string;
  deck_id: string;
  flashcard_id: string;
  position: number;
  flashcard: {
    id: string;
    front: string;
    category: { id: string; name: string } | null;
    difficulty: string;
  };
};

export async function getAllAdminDecks(userId: string): Promise<AdminDeckRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcard_decks")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!flashcard_decks_author_id_fkey(id, first_name, last_name),
      flashcard_deck_items(count)
    `,
    )
    .eq("author_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[flashcards admin] list decks", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const embed = r.flashcard_deck_items as { count: number }[] | null | undefined;
    const countEl = Array.isArray(embed) ? embed[0] : null;
    const card_count = countEl?.count ?? 0;
    return {
      ...(row as unknown as AdminDeckRow),
      category: single(r.category as AdminDeckRow["category"]),
      author: single(r.author as AdminDeckRow["author"]),
      card_count,
    };
  });
}

export async function getAdminDeckById(
  id: string,
  userId: string,
): Promise<{ deck: AdminDeckRow; items: AdminDeckItemRow[] } | null> {
  const supabase = await createClient();

  const { data: deckData, error: deckErr } = await supabase
    .from("flashcard_decks")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!flashcard_decks_author_id_fkey(id, first_name, last_name)
    `,
    )
    .eq("id", id)
    .eq("author_id", userId)
    .maybeSingle();

  if (deckErr || !deckData) return null;

  const { data: itemsData, error: itemsErr } = await supabase
    .from("flashcard_deck_items")
    .select(
      `
      id,
      deck_id,
      flashcard_id,
      position,
      flashcard:flashcards(
        id,
        front,
        difficulty,
        category:blog_categories(id, name)
      )
    `,
    )
    .eq("deck_id", id)
    .order("position", { ascending: true });

  if (itemsErr) {
    console.error("[flashcards admin] deck items", itemsErr.message);
    return null;
  }

  const items: AdminDeckItemRow[] = (itemsData ?? []).map((raw) => {
    const it = raw as Record<string, unknown>;
    const fRaw = it.flashcard;
    const f = Array.isArray(fRaw) ? fRaw[0] : fRaw;
    const fr = (f && typeof f === "object" ? f : {}) as Record<string, unknown>;
    const cat = single(fr.category as { id: string; name: string } | { id: string; name: string }[] | null);
    return {
      id: String(it.id),
      deck_id: String(it.deck_id),
      flashcard_id: String(it.flashcard_id),
      position: Number(it.position),
      flashcard: {
        id: String(fr.id ?? ""),
        front: String(fr.front ?? ""),
        category: cat,
        difficulty: String(fr.difficulty ?? "intermediate"),
      },
    };
  });

  const r = deckData as Record<string, unknown>;
  const deck: AdminDeckRow = {
    ...(deckData as unknown as AdminDeckRow),
    category: single(r.category as AdminDeckRow["category"]),
    author: single(r.author as AdminDeckRow["author"]),
    card_count: items.length,
  };

  return { deck, items };
}

export type PickerFlashcardRow = {
  id: string;
  front: string;
  category: { id: string; name: string } | null;
  audience: string | null;
  difficulty: string;
};

function sanitizeIlikeTerm(term: string): string {
  return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/** Published flashcards for deck picker; excludes IDs already in the deck (client may pass []). */
export async function searchAdminFlashcardsForPicker(
  searchQuery: string,
  excludeIds: string[] = [],
): Promise<PickerFlashcardRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("flashcards")
    .select(
      `
      id,
      front,
      target_audience,
      difficulty,
      category:blog_categories(id, name)
    `,
    )
    .eq("status", "published");

  const term = searchQuery.trim();
  if (term) {
    const s = sanitizeIlikeTerm(term);
    query = query.ilike("front", `%${s}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(100);

  if (error) {
    console.error("[flashcards admin] picker flashcards", error.message);
    return [];
  }

  const exclude = new Set(excludeIds);

  return (data ?? [])
    .map((row) => {
      const r = row as Record<string, unknown>;
      const cat = single(r.category as { id: string; name: string } | { id: string; name: string }[] | null);
      return {
        id: String(r.id),
        front: String(r.front),
        category: cat,
        audience: (r.target_audience as string | null) ?? null,
        difficulty: String(r.difficulty ?? "intermediate"),
      };
    })
    .filter((x) => !exclude.has(x.id));
}
