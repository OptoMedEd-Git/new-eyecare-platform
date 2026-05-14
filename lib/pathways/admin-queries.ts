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
