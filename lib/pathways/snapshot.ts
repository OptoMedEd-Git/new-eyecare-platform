import type { SupabaseClient } from "@supabase/supabase-js";

import type { PublicPathwayModuleRow, PublicPathwayPhase } from "@/lib/pathways/types";

export const PUBLISHED_STRUCTURE_VERSION = 1 as const;

/** Row shape stored in pathways.published_structure (by reference + display fields). */
export type PublishedStructurePhase = {
  id: string;
  position: number;
  title: string;
  description: string | null;
};

export type PublishedStructureModule = {
  id: string;
  phase_id: string;
  position: number;
  module_type: string;
  title: string;
  context_markdown: string | null;
  course_id: string | null;
  quiz_id: string | null;
  flashcard_deck_id: string | null;
  blog_post_id: string | null;
  external_url: string | null;
  external_label: string | null;
};

export type PublishedStructure = {
  version: typeof PUBLISHED_STRUCTURE_VERSION;
  phases: PublishedStructurePhase[];
  modules: PublishedStructureModule[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function parsePublishedStructure(raw: unknown): PublishedStructure | null {
  if (!isRecord(raw)) return null;
  if (Number(raw.version) !== PUBLISHED_STRUCTURE_VERSION) return null;
  if (!Array.isArray(raw.phases) || !Array.isArray(raw.modules)) return null;

  const phases: PublishedStructurePhase[] = raw.phases.map((p) => {
    const pr = p as Record<string, unknown>;
    return {
      id: String(pr.id),
      position: Number(pr.position),
      title: String(pr.title),
      description: pr.description == null ? null : String(pr.description),
    };
  });

  const modules: PublishedStructureModule[] = raw.modules.map((m) => {
    const mr = m as Record<string, unknown>;
    return {
      id: String(mr.id),
      phase_id: String(mr.phase_id),
      position: Number(mr.position),
      module_type: String(mr.module_type),
      title: String(mr.title),
      context_markdown: mr.context_markdown == null ? null : String(mr.context_markdown),
      course_id: mr.course_id == null ? null : String(mr.course_id),
      quiz_id: mr.quiz_id == null ? null : String(mr.quiz_id),
      flashcard_deck_id: mr.flashcard_deck_id == null ? null : String(mr.flashcard_deck_id),
      blog_post_id: mr.blog_post_id == null ? null : String(mr.blog_post_id),
      external_url: mr.external_url == null ? null : String(mr.external_url),
      external_label: mr.external_label == null ? null : String(mr.external_label),
    };
  });

  return { version: PUBLISHED_STRUCTURE_VERSION, phases, modules };
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
 * Build PublicPathwayModuleRow from snapshot module row + live linked-content status (orphan rules).
 */
export async function materializePublicModuleFromSnapshot(
  supabase: SupabaseClient,
  m: PublishedStructureModule,
): Promise<PublicPathwayModuleRow> {
  const row = m as PublishedStructureModule & { module_type: string };

  let linked_slug: string | null = null;
  let linked_title: string | null = null;
  let linked_course_id: string | null = null;
  let linked_quiz_id: string | null = null;
  let linked_flashcard_deck_id: string | null = null;
  let linked_blog_post_id: string | null = null;
  let is_orphaned = false;

  switch (row.module_type) {
    case "course": {
      if (!m.course_id) {
        is_orphaned = true;
        break;
      }
      const { data } = await supabase
        .from("courses")
        .select("id, title, slug, status, category:blog_categories(name)")
        .eq("id", m.course_id)
        .maybeSingle();
      const c = data as unknown as LinkedEmbed;
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
      if (!m.quiz_id) {
        is_orphaned = true;
        break;
      }
      const { data } = await supabase
        .from("quizzes")
        .select("id, title, slug, status, category:blog_categories(name)")
        .eq("id", m.quiz_id)
        .maybeSingle();
      const q = data as unknown as LinkedEmbed;
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
      if (!m.flashcard_deck_id) {
        is_orphaned = true;
        break;
      }
      const { data } = await supabase
        .from("flashcard_decks")
        .select("id, title, slug, status, category:blog_categories(name)")
        .eq("id", m.flashcard_deck_id)
        .maybeSingle();
      const d = data as unknown as LinkedEmbed;
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
      if (!m.blog_post_id) {
        is_orphaned = true;
        break;
      }
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, status, category:blog_categories!blog_posts_category_id_fkey(name)")
        .eq("id", m.blog_post_id)
        .maybeSingle();
      const p = data as unknown as LinkedEmbed;
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
      const url = m.external_url == null ? "" : String(m.external_url).trim();
      if (!url) {
        is_orphaned = true;
      }
      linked_title = m.external_label == null ? null : String(m.external_label);
      break;
    }
    default:
      is_orphaned = true;
      break;
  }

  return {
    id: m.id,
    phase_id: m.phase_id,
    position: m.position,
    module_type: row.module_type as PublicPathwayModuleRow["module_type"],
    title: m.title,
    context_markdown: m.context_markdown,
    is_orphaned,
    linked_slug,
    linked_title,
    linked_course_id,
    linked_quiz_id,
    linked_flashcard_deck_id,
    linked_blog_post_id,
    external_url: m.external_url,
    external_label: m.external_label,
  };
}

export async function materializePublicModulesFromSnapshot(
  supabase: SupabaseClient,
  structure: PublishedStructure,
): Promise<PublicPathwayModuleRow[]> {
  const sorted = [...structure.modules].sort((a, b) => {
    const pa = structure.phases.find((p) => p.id === a.phase_id)?.position ?? 0;
    const pb = structure.phases.find((p) => p.id === b.phase_id)?.position ?? 0;
    if (pa !== pb) return pa - pb;
    return a.position - b.position;
  });
  return Promise.all(sorted.map((m) => materializePublicModuleFromSnapshot(supabase, m)));
}

export function publicPhasesFromSnapshot(
  structure: PublishedStructure,
  pathwayId: string,
  modulesFlat: PublicPathwayModuleRow[],
): PublicPathwayPhase[] {
  const sortedPhases = [...structure.phases].sort((a, b) => a.position - b.position);
  const byPhase = new Map<string, PublicPathwayModuleRow[]>();
  for (const p of sortedPhases) {
    byPhase.set(p.id, []);
  }
  for (const m of modulesFlat) {
    const bucket = byPhase.get(m.phase_id);
    if (bucket) bucket.push(m);
  }
  for (const list of byPhase.values()) {
    list.sort((a, b) => a.position - b.position);
  }
  return sortedPhases.map((pr) => ({
    id: pr.id,
    pathwayId,
    position: pr.position,
    title: pr.title,
    description: pr.description,
    modules: byPhase.get(pr.id) ?? [],
  }));
}

/** Serialize current live (non-removed) structure for a pathway into snapshot JSON. */
export async function serializeLivePathwayStructure(
  supabase: SupabaseClient,
  pathwayId: string,
): Promise<PublishedStructure> {
  const { data: phaseRows, error: pErr } = await supabase
    .from("pathway_phases")
    .select("id, pathway_id, position, title, description")
    .eq("pathway_id", pathwayId)
    .is("removed_at", null)
    .order("position", { ascending: true });

  if (pErr) {
    console.error("[pathways snapshot] phases", pErr.message);
  }

  const { data: modRows, error: mErr } = await supabase
    .from("pathway_modules")
    .select(
      "id, phase_id, position, module_type, title, context_markdown, course_id, quiz_id, flashcard_deck_id, blog_post_id, external_url, external_label",
    )
    .eq("pathway_id", pathwayId)
    .is("removed_at", null)
    .order("position", { ascending: true });

  if (mErr) {
    console.error("[pathways snapshot] modules", mErr.message);
  }

  const phases: PublishedStructurePhase[] = (phaseRows ?? []).map((pr) => ({
    id: String(pr.id),
    position: Number(pr.position),
    title: String(pr.title),
    description: pr.description == null ? null : String(pr.description),
  }));

  const phasePos = new Map((phaseRows ?? []).map((r) => [String(r.id), Number(r.position)]));
  const modules: PublishedStructureModule[] = [...(modRows ?? [])]
    .sort((a, b) => {
      const pa = phasePos.get(String(a.phase_id)) ?? 0;
      const pb = phasePos.get(String(b.phase_id)) ?? 0;
      if (pa !== pb) return pa - pb;
      return Number(a.position) - Number(b.position);
    })
    .map((mr) => ({
      id: String(mr.id),
      phase_id: String(mr.phase_id),
      position: Number(mr.position),
      module_type: String(mr.module_type),
      title: String(mr.title),
      context_markdown: mr.context_markdown == null ? null : String(mr.context_markdown),
      course_id: mr.course_id == null ? null : String(mr.course_id),
      quiz_id: mr.quiz_id == null ? null : String(mr.quiz_id),
      flashcard_deck_id: mr.flashcard_deck_id == null ? null : String(mr.flashcard_deck_id),
      blog_post_id: mr.blog_post_id == null ? null : String(mr.blog_post_id),
      external_url: mr.external_url == null ? null : String(mr.external_url),
      external_label: mr.external_label == null ? null : String(mr.external_label),
    }));

  return { version: PUBLISHED_STRUCTURE_VERSION, phases, modules };
}

/** Hard-delete tombstone rows after a successful republish (completions cascade). */
export async function deleteTombstonedStructureRows(supabase: SupabaseClient, pathwayId: string): Promise<void> {
  await supabase.from("pathway_modules").delete().eq("pathway_id", pathwayId).not("removed_at", "is", null);
  await supabase.from("pathway_phases").delete().eq("pathway_id", pathwayId).not("removed_at", "is", null);
}
