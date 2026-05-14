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
  phase_id: string;
  position: number;
  title: string;
  context_markdown: string | null;
  module_type: string;
  linked_title: string | null;
  linked_meta: string | null;
  linked_url: string | null;
  is_orphaned: boolean;
};

/** Admin phase with nested modules (V2-B will manage phases). */
export type AdminPathwayPhase = {
  id: string;
  pathwayId: string;
  position: number;
  title: string;
  description: string | null;
  modules: AdminPathwayModuleRow[];
};

type LinkedEmbed = {
  id: string;
  title: string;
  slug: string;
  category: { name: string } | { name: string }[] | null;
} | null;

type PhasePositionEmbed = { position: number } | { position: number }[] | null;

function phaseSortKey(raw: Record<string, unknown>): number {
  const ph = raw.phase as PhasePositionEmbed | undefined;
  if (!ph) return 0;
  const el = Array.isArray(ph) ? ph[0] : ph;
  return el ? Number(el.position) : 0;
}

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
      phase_id,
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
      phase:pathway_phases!inner(position, removed_at),
      course:courses(id, title, slug, category:blog_categories(name)),
      quiz:quizzes(id, title, slug, category:blog_categories(name)),
      flashcard_deck:flashcard_decks(id, title, slug, category:blog_categories(name)),
      blog_post:blog_posts(id, title, slug, category:blog_categories!blog_posts_category_id_fkey(name))
    `,
    )
    .eq("pathway_id", pathwayId)
    .is("removed_at", null);

  if (error) {
    console.error("[pathways admin] modules", error.message);
    return [];
  }

  const rows = [...(data ?? [])].filter((raw) => {
    const ph = raw.phase as { removed_at?: string | null } | { removed_at?: string | null }[] | null | undefined;
    const el = Array.isArray(ph) ? ph[0] : ph;
    return el != null && (el.removed_at == null || el.removed_at === "");
  }) as Record<string, unknown>[];

  rows.sort((a, b) => {
    const dp = phaseSortKey(a) - phaseSortKey(b);
    if (dp !== 0) return dp;
    return Number(a.position) - Number(b.position);
  });

  return rows.map((raw) => {
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
      phase_id: String(row.phase_id),
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

/** Grouped admin view: phases with nested modules (V2-B). */
export async function getAdminPathwayPhases(pathwayId: string): Promise<AdminPathwayPhase[]> {
  const supabase = await createClient();

  const { data: phaseRows, error: pErr } = await supabase
    .from("pathway_phases")
    .select("id, pathway_id, position, title, description")
    .eq("pathway_id", pathwayId)
    .is("removed_at", null)
    .order("position", { ascending: true });

  if (pErr) {
    console.error("[pathways admin] phases", pErr.message);
    return [];
  }

  const modulesFlat = await getAdminPathwayModules(pathwayId);
  const byPhase = new Map<string, AdminPathwayModuleRow[]>();
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
