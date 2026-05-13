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
