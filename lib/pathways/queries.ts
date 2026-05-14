import { createClient } from "@/lib/supabase/server";

import type {
  PathwayListing,
  PathwayWithModules,
  PublicPathwayModuleRow,
} from "./types";

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function rowToListing(row: Record<string, unknown>, moduleCountOverride?: number): PathwayListing {
  const cat = single(row.category as { id: string; name: string } | { id: string; name: string }[] | null);
  const embed = row.pathway_modules as { count: number }[] | null | undefined;
  const countEl = Array.isArray(embed) ? embed[0] : null;
  const moduleCount =
    moduleCountOverride !== undefined ? moduleCountOverride : (countEl?.count ?? 0);

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: row.description == null ? null : String(row.description),
    category: cat ? { id: String(cat.id), name: String(cat.name) } : null,
    audience: (row.target_audience as PathwayListing["audience"]) ?? null,
    difficulty: (row.difficulty as PathwayListing["difficulty"]) ?? null,
    estimatedDurationText: row.estimated_duration_text == null ? null : String(row.estimated_duration_text),
    isFeatured: Boolean(row.is_featured),
    status: row.status === "published" ? "published" : "draft",
    authorId: row.author_id == null ? null : String(row.author_id),
    publishedAt: row.published_at == null ? null : String(row.published_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    moduleCount,
  };
}

type LinkedEmbed = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: { name: string } | { name: string }[] | null;
} | null;

function isPublishedContent(row: LinkedEmbed): row is NonNullable<LinkedEmbed> {
  return row != null && row.status === "published";
}

/**
 * Public pathway modules with joins and stricter orphan rules than admin:
 * orphaned if embed missing OR linked row status !== 'published'.
 */
export async function getPublicPathwayModules(pathwayId: string): Promise<PublicPathwayModuleRow[]> {
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
      external_url,
      external_label,
      course:courses(id, title, slug, status, category:blog_categories(name)),
      quiz:quizzes(id, title, slug, status, category:blog_categories(name)),
      flashcard_deck:flashcard_decks(id, title, slug, status, category:blog_categories(name)),
      blog_post:blog_posts(id, title, slug, status, category:blog_categories!blog_posts_category_id_fkey(name))
    `,
    )
    .eq("pathway_id", pathwayId)
    .order("position", { ascending: true });

  if (error) {
    console.error("[pathways] getPublicPathwayModules", error.message);
    return [];
  }

  return (data ?? []).map((raw) => {
    const row = raw as Record<string, unknown> & {
      module_type: string;
      external_url: string | null;
      external_label: string | null;
    };

    let linked_slug: string | null = null;
    let linked_title: string | null = null;
    let linked_course_id: string | null = null;
    let linked_quiz_id: string | null = null;
    let linked_flashcard_deck_id: string | null = null;
    let linked_blog_post_id: string | null = null;
    let is_orphaned = false;

    switch (row.module_type) {
      case "course": {
        const c = single(row.course as LinkedEmbed);
        if (!isPublishedContent(c)) {
          is_orphaned = true;
        } else {
          linked_slug = c.slug;
          linked_title = c.title;
          linked_course_id = c.id;
        }
        break;
      }
      case "quiz": {
        const q = single(row.quiz as LinkedEmbed);
        if (!isPublishedContent(q)) {
          is_orphaned = true;
        } else {
          linked_slug = q.slug;
          linked_title = q.title;
          linked_quiz_id = q.id;
        }
        break;
      }
      case "flashcard_deck": {
        const d = single(row.flashcard_deck as LinkedEmbed);
        if (!isPublishedContent(d)) {
          is_orphaned = true;
        } else {
          linked_slug = d.slug;
          linked_title = d.title;
          linked_flashcard_deck_id = d.id;
        }
        break;
      }
      case "blog_post": {
        const p = single(row.blog_post as LinkedEmbed);
        if (!isPublishedContent(p)) {
          is_orphaned = true;
        } else {
          linked_slug = p.slug;
          linked_title = p.title;
          linked_blog_post_id = p.id;
        }
        break;
      }
      case "external_resource": {
        const url = row.external_url == null ? "" : String(row.external_url).trim();
        if (!url) {
          is_orphaned = true;
        }
        linked_title = row.external_label == null ? null : String(row.external_label);
        break;
      }
      default:
        is_orphaned = true;
        break;
    }

    return {
      id: String(row.id),
      position: Number(row.position),
      module_type: row.module_type as PublicPathwayModuleRow["module_type"],
      title: String(row.title),
      context_markdown: row.context_markdown == null ? null : String(row.context_markdown),
      is_orphaned,
      linked_slug,
      linked_title,
      linked_course_id,
      linked_quiz_id,
      linked_flashcard_deck_id,
      linked_blog_post_id,
      external_url: row.external_url == null ? null : String(row.external_url),
      external_label: row.external_label == null ? null : String(row.external_label),
    };
  });
}

export async function getPublishedPathways(): Promise<PathwayListing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pathways")
    .select(
      `
      *,
      category:blog_categories(id, name),
      pathway_modules(count)
    `,
    )
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("[pathways] getPublishedPathways", error?.message);
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => rowToListing(row));
}

export async function getPublishedPathwayBySlug(slug: string): Promise<PathwayWithModules | null> {
  const supabase = await createClient();

  const { data: pathwayRow, error } = await supabase
    .from("pathways")
    .select(
      `
      *,
      category:blog_categories(id, name),
      pathway_modules(count)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !pathwayRow) {
    if (error) console.error("[pathways] getPublishedPathwayBySlug", error.message);
    return null;
  }

  const pr = pathwayRow as Record<string, unknown>;
  const listing = rowToListing(pr);

  return {
    ...listing,
    modules: [],
  };
}
