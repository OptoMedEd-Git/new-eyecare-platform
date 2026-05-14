import { createClient } from "@/lib/supabase/server";

export type PickerItem = {
  id: string;
  title: string;
  meta: string;
  slug: string;
};

function sanitizeIlikeTerm(raw: string): string {
  return raw.trim().replace(/[%_]/g, "");
}

export async function searchCoursesForPicker(searchQuery: string): Promise<PickerItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select("id, title, slug, category:blog_categories(name)")
    .eq("status", "published");

  const term = sanitizeIlikeTerm(searchQuery);
  if (term.length > 0) {
    query = query.ilike("title", `%${term}%`);
  }

  const { data, error } = await query.order("title", { ascending: true }).limit(50);
  if (error || !data) return [];

  return data.map((row) => {
    const r = row as {
      id: string;
      title: string;
      slug: string;
      category: { name: string } | { name: string }[] | null;
    };
    const cat = Array.isArray(r.category) ? r.category[0] : r.category;
    return { id: r.id, title: r.title, slug: r.slug, meta: cat?.name ?? "—" };
  });
}

export async function searchQuizzesForPicker(searchQuery: string): Promise<PickerItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("quizzes")
    .select("id, title, slug, category:blog_categories(name)")
    .eq("status", "published")
    .eq("kind", "curated");

  const term = sanitizeIlikeTerm(searchQuery);
  if (term.length > 0) {
    query = query.ilike("title", `%${term}%`);
  }

  const { data, error } = await query.order("title", { ascending: true }).limit(50);
  if (error || !data) return [];

  return data.map((row) => {
    const r = row as {
      id: string;
      title: string;
      slug: string;
      category: { name: string } | { name: string }[] | null;
    };
    const cat = Array.isArray(r.category) ? r.category[0] : r.category;
    return { id: r.id, title: r.title, slug: r.slug, meta: cat?.name ?? "—" };
  });
}

export async function searchFlashcardDecksForPicker(searchQuery: string): Promise<PickerItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("flashcard_decks")
    .select("id, title, slug, category:blog_categories(name)")
    .eq("status", "published");

  const term = sanitizeIlikeTerm(searchQuery);
  if (term.length > 0) {
    query = query.ilike("title", `%${term}%`);
  }

  const { data, error } = await query.order("title", { ascending: true }).limit(50);
  if (error || !data) return [];

  return data.map((row) => {
    const r = row as {
      id: string;
      title: string;
      slug: string;
      category: { name: string } | { name: string }[] | null;
    };
    const cat = Array.isArray(r.category) ? r.category[0] : r.category;
    return { id: r.id, title: r.title, slug: r.slug, meta: cat?.name ?? "—" };
  });
}

export async function searchBlogPostsForPicker(searchQuery: string): Promise<PickerItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select("id, title, slug, category:blog_categories!blog_posts_category_id_fkey(name)")
    .eq("status", "published");

  const term = sanitizeIlikeTerm(searchQuery);
  if (term.length > 0) {
    query = query.ilike("title", `%${term}%`);
  }

  const { data, error } = await query.order("updated_at", { ascending: false }).limit(50);
  if (error || !data) return [];

  return data.map((row) => {
    const r = row as {
      id: string;
      title: string;
      slug: string;
      category: { name: string } | { name: string }[] | null;
    };
    const cat = Array.isArray(r.category) ? r.category[0] : r.category;
    return { id: r.id, title: r.title, slug: r.slug, meta: cat?.name ?? "—" };
  });
}
