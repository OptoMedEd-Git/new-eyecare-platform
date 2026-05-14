import { createClient } from "@/lib/supabase/server";

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export type AdminPathwayRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category_id: string | null;
  category: { id: string; name: string } | null;
  target_audience: string | null;
  difficulty: string | null;
  estimated_duration_text: string | null;
  is_featured: boolean;
  status: string;
  author_id: string | null;
  author: { id: string; first_name: string | null; last_name: string | null } | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  module_count: number;
};

function mapRow(row: Record<string, unknown>): AdminPathwayRow {
  const embed = row.pathway_modules as { count: number }[] | null | undefined;
  const countEl = Array.isArray(embed) ? embed[0] : null;
  const module_count = countEl?.count ?? 0;

  return {
    ...(row as unknown as AdminPathwayRow),
    category: single(row.category as AdminPathwayRow["category"]),
    author: single(row.author as AdminPathwayRow["author"]),
    module_count,
  };
}

export async function getAllAdminPathways(userId: string): Promise<AdminPathwayRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pathways")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!pathways_author_id_fkey(id, first_name, last_name),
      pathway_modules(count)
    `,
    )
    .eq("author_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[pathways admin] list", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function getAdminPathwayById(id: string, userId: string): Promise<AdminPathwayRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pathways")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!pathways_author_id_fkey(id, first_name, last_name),
      pathway_modules(count)
    `,
    )
    .eq("id", id)
    .eq("author_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[pathways admin] get by id", error.message);
    return null;
  }
  if (!data) return null;

  return mapRow(data as Record<string, unknown>);
}

export type AdminPathwayModuleRow = {
  id: string;
  position: number;
  title: string;
  context_markdown: string | null;
  module_type: string;
  linked_title: string | null;
  linked_meta: string | null;
  linked_url: string | null;
  is_orphaned: boolean;
};

type LinkedEmbed = {
  id: string;
  title: string;
  slug: string;
  category: { name: string } | { name: string }[] | null;
} | null;

type LinkedCategory = { name: string } | { name: string }[] | null;

function catName(cat: LinkedCategory): string | null {
  if (!cat) return null;
  const c = Array.isArray(cat) ? cat[0] : cat;
  return c?.name ?? null;
}

export async function getAdminPathwayModules(pathwayId: string): Promise<AdminPathwayModuleRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pathway_modules")
    .select(
      `
      id,
      position,
      title,
      context_markdown,
      module_type,
      course_id,
      quiz_id,
      flashcard_deck_id,
      blog_post_id,
      external_url,
      external_label,
      course:courses(id, title, slug, category:blog_categories(name)),
      quiz:quizzes(id, title, slug, category:blog_categories(name)),
      flashcard_deck:flashcard_decks(id, title, slug, category:blog_categories(name)),
      blog_post:blog_posts(id, title, slug, category:blog_categories!blog_posts_category_id_fkey(name))
    `,
    )
    .eq("pathway_id", pathwayId)
    .order("position", { ascending: true });

  if (error) {
    console.error("[pathways admin] modules", error.message);
    return [];
  }

  return (data ?? []).map((raw) => {
    const row = raw as Record<string, unknown> & {
      module_type: string;
      external_url: string | null;
      external_label: string | null;
    };

    let linked_title: string | null = null;
    let linked_meta: string | null = null;
    let linked_url: string | null = null;
    let is_orphaned = false;

    switch (row.module_type) {
      case "course": {
        const c = single(row.course as LinkedEmbed);
        if (c) {
          linked_title = c.title;
          linked_meta = catName(c.category);
          linked_url = `/courses/${c.slug}`;
        } else {
          is_orphaned = true;
        }
        break;
      }
      case "quiz": {
        const q = single(row.quiz as LinkedEmbed);
        if (q) {
          linked_title = q.title;
          linked_meta = catName(q.category);
          linked_url = `/quiz-bank/quizzes/${q.slug}`;
        } else {
          is_orphaned = true;
        }
        break;
      }
      case "flashcard_deck": {
        const d = single(row.flashcard_deck as LinkedEmbed);
        if (d) {
          linked_title = d.title;
          linked_meta = catName(d.category);
          linked_url = `/flashcards/decks/${d.slug}`;
        } else {
          is_orphaned = true;
        }
        break;
      }
      case "blog_post": {
        const p = single(row.blog_post as LinkedEmbed);
        if (p) {
          linked_title = p.title;
          linked_meta = catName(p.category);
          linked_url = `/blog/${p.slug}`;
        } else {
          is_orphaned = true;
        }
        break;
      }
      case "external_resource":
        linked_title = row.external_label;
        linked_meta = null;
        linked_url = row.external_url;
        break;
      default:
        break;
    }

    return {
      id: row.id as string,
      position: row.position as number,
      title: row.title as string,
      context_markdown: (row.context_markdown as string | null) ?? null,
      module_type: row.module_type,
      linked_title,
      linked_meta,
      linked_url,
      is_orphaned,
    };
  });
}
