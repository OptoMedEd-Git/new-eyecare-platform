import { createClient } from "@/lib/supabase/server";

import {
  materializePublicModulesFromSnapshot,
  parsePublishedStructure,
  publicPhasesFromSnapshot,
} from "./snapshot";
import type {
  PathwayListing,
  PathwayWithModules,
  PublicPathwayModuleRow,
  PublicPathwayPhase,
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

type PhasePositionEmbed = { position: number } | { position: number }[] | null;

function phaseSortKey(raw: Record<string, unknown>): number {
  const ph = raw.phase as PhasePositionEmbed | undefined;
  if (!ph) return 0;
  const el = Array.isArray(ph) ? ph[0] : ph;
  return el ? Number(el.position) : 0;
}

function mapRawToPublicPathwayModule(
  raw: Record<string, unknown> & {
    module_type: string;
    external_url: string | null;
    external_label: string | null;
  },
): PublicPathwayModuleRow {
  const row = raw;

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
    phase_id: String(row.phase_id),
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
}

/**
 * Public pathway modules with joins and stricter orphan rules than admin.
 * Flat list ordered by (phase position, module position) for P4 completion and pathway banner.
 */
export async function getPublicPathwayModules(pathwayId: string): Promise<PublicPathwayModuleRow[]> {
  const supabase = await createClient();

  const { data: pw, error: pwErr } = await supabase
    .from("pathways")
    .select("status, published_structure")
    .eq("id", pathwayId)
    .maybeSingle();

  if (pwErr) {
    console.error("[pathways] getPublicPathwayModules pathway", pwErr.message);
  }

  if (pw?.status === "published") {
    const parsed = parsePublishedStructure(pw.published_structure);
    if (parsed) {
      return materializePublicModulesFromSnapshot(supabase, parsed);
    }
  }

  const { data, error } = await supabase
    .from("pathway_modules")
    .select(
      `
      id,
      phase_id,
      position,
      title,
      context_markdown,
      module_type,
      external_url,
      external_label,
      phase:pathway_phases!inner(position, removed_at),
      course:courses(id, title, slug, status, category:blog_categories(name)),
      quiz:quizzes(id, title, slug, status, category:blog_categories(name)),
      flashcard_deck:flashcard_decks(id, title, slug, status, category:blog_categories(name)),
      blog_post:blog_posts(id, title, slug, status, category:blog_categories!blog_posts_category_id_fkey(name))
    `,
    )
    .eq("pathway_id", pathwayId)
    .is("removed_at", null);

  if (error) {
    console.error("[pathways] getPublicPathwayModules", error.message);
    return [];
  }

  const rows = [...(data ?? [])].filter((raw) => {
    const ph = raw.phase as { removed_at?: string | null } | { removed_at?: string | null }[] | null | undefined;
    const el = Array.isArray(ph) ? ph[0] : ph;
    return el != null && (el.removed_at == null || el.removed_at === "");
  }) as Array<
    Record<string, unknown> & { module_type: string; external_url: string | null; external_label: string | null }
  >;

  rows.sort((a, b) => {
    const dp = phaseSortKey(a) - phaseSortKey(b);
    if (dp !== 0) return dp;
    return Number(a.position) - Number(b.position);
  });

  return rows.map((raw) => mapRawToPublicPathwayModule(raw));
}

/**
 * Pathway phases with nested modules (V2-C will render this shape).
 * Pass `preloadedModules` to avoid a second full module query when you already called `getPublicPathwayModules`.
 */
export async function getPublicPathwayPhases(
  pathwayId: string,
  preloadedModules?: PublicPathwayModuleRow[],
): Promise<PublicPathwayPhase[]> {
  const supabase = await createClient();

  const { data: phaseRows, error: pErr } = await supabase
    .from("pathway_phases")
    .select("id, pathway_id, position, title, description")
    .eq("pathway_id", pathwayId)
    .is("removed_at", null)
    .order("position", { ascending: true });

  if (pErr) {
    console.error("[pathways] getPublicPathwayPhases", pErr.message);
    return [];
  }

  const modulesFlat = preloadedModules ?? (await getPublicPathwayModules(pathwayId));
  const byPhase = new Map<string, PublicPathwayModuleRow[]>();
  for (const p of phaseRows ?? []) {
    byPhase.set(String(p.id), []);
  }
  for (const m of modulesFlat) {
    const bucket = byPhase.get(m.phase_id);
    if (bucket) bucket.push(m);
  }
  for (const list of byPhase.values()) {
    list.sort((a, b) => a.position - b.position);
  }

  return (phaseRows ?? []).map((pr) => ({
    id: String(pr.id),
    pathwayId: String(pr.pathway_id),
    position: Number(pr.position),
    title: String(pr.title),
    description: pr.description == null ? null : String(pr.description),
    modules: byPhase.get(String(pr.id)) ?? [],
  }));
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

  return (data as Record<string, unknown>[]).map((row) => {
    const parsed = parsePublishedStructure(row.published_structure);
    return rowToListing(row, parsed ? parsed.modules.length : undefined);
  });
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
  const parsed = parsePublishedStructure(pr.published_structure);
  const listing = rowToListing(pr, parsed ? parsed.modules.length : undefined);

  if (parsed) {
    const modulesFlat = await materializePublicModulesFromSnapshot(supabase, parsed);
    const phases = publicPhasesFromSnapshot(parsed, listing.id, modulesFlat);
    return {
      ...listing,
      modules: [],
      phases,
    };
  }

  const modulesFlat = await getPublicPathwayModules(listing.id);
  const phases = await getPublicPathwayPhases(listing.id, modulesFlat);

  return {
    ...listing,
    modules: [],
    phases,
  };
}
