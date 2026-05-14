import { createClient } from "@/lib/supabase/server";

import type {
  PathwayListing,
  PathwayModuleRecord,
  PathwayModuleType,
  PathwayWithModules,
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

function rowToModule(row: Record<string, unknown>): PathwayModuleRecord {
  return {
    id: String(row.id),
    pathwayId: String(row.pathway_id),
    position: Number(row.position),
    title: String(row.title),
    contextMarkdown: row.context_markdown == null ? null : String(row.context_markdown),
    moduleType: row.module_type as PathwayModuleType,
    courseId: row.course_id == null ? null : String(row.course_id),
    quizId: row.quiz_id == null ? null : String(row.quiz_id),
    flashcardDeckId: row.flashcard_deck_id == null ? null : String(row.flashcard_deck_id),
    blogPostId: row.blog_post_id == null ? null : String(row.blog_post_id),
    externalUrl: row.external_url == null ? null : String(row.external_url),
    externalLabel: row.external_label == null ? null : String(row.external_label),
  };
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
      category:blog_categories(id, name)
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

  const { data: moduleRows, error: modErr } = await supabase
    .from("pathway_modules")
    .select("*")
    .eq("pathway_id", pr.id as string)
    .order("position", { ascending: true });

  if (modErr) {
    console.error("[pathways] modules", modErr.message);
  }

  const modules: PathwayModuleRecord[] = (moduleRows ?? []).map((r) => rowToModule(r as Record<string, unknown>));
  const listing = rowToListing(pr, modules.length);

  return {
    ...listing,
    moduleCount: modules.length,
    modules,
  };
}
