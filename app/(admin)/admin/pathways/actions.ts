"use server";

import { revalidatePath } from "next/cache";

import { ensureUniqueSlug, slugify, slugifyShort } from "@/lib/blog/slugify";
import { deleteTombstonedStructureRows, serializeLivePathwayStructure } from "@/lib/pathways/snapshot";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const DIFFICULTIES = ["foundational", "intermediate", "advanced"] as const;
const AUDIENCES = ["student", "resident", "practicing", "all"] as const;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseOptionalUuid(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  return isUuid(raw) ? raw : null;
}

function parseDifficulty(formData: FormData): string | null {
  const raw = String(formData.get("difficulty") ?? "").trim();
  if (!raw) return null;
  return DIFFICULTIES.includes(raw as (typeof DIFFICULTIES)[number]) ? raw : null;
}

function parseAudience(formData: FormData): string | null {
  const raw = String(formData.get("target_audience") ?? "").trim();
  if (!raw) return null;
  return AUDIENCES.includes(raw as (typeof AUDIENCES)[number]) ? raw : null;
}

function revalidatePathwayPaths(slug?: string | null) {
  revalidatePath("/admin/pathways");
  revalidatePath("/pathways");
  if (slug) {
    revalidatePath(`/pathways/${slug}`);
  }
}

export async function createPathway(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const categoryId = parseOptionalUuid(formData, "category_id");
  const targetAudience = parseAudience(formData);
  const difficulty = parseDifficulty(formData);
  const estimatedDurationText = String(formData.get("estimated_duration_text") ?? "").trim() || null;
  const isFeatured = formData.get("is_featured") === "on";

  if (!title) return { success: false, error: "Title is required" };

  const baseSlug = slugInput ? slugify(slugInput) : slugifyShort(title);
  if (!baseSlug) return { success: false, error: "Could not derive a URL slug from the title" };

  let slug: string;
  try {
    slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const { data } = await supabase.from("pathways").select("id").eq("slug", s).maybeSingle();
      return !!data;
    });
  } catch {
    return { success: false, error: "Could not allocate a unique slug" };
  }

  const { data, error } = await supabase
    .from("pathways")
    .insert({
      title,
      slug,
      description,
      category_id: categoryId,
      target_audience: targetAudience,
      difficulty,
      estimated_duration_text: estimatedDurationText,
      is_featured: isFeatured,
      status: "draft",
      author_id: user.id,
      published_at: null,
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("createPathway error:", error);
    return { success: false, error: "Could not create pathway" };
  }

  revalidatePath("/admin/pathways");
  return { success: true, data: { id: data.id } };
}

export async function updatePathway(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const categoryId = parseOptionalUuid(formData, "category_id");
  const targetAudience = parseAudience(formData);
  const difficulty = parseDifficulty(formData);
  const estimatedDurationText = String(formData.get("estimated_duration_text") ?? "").trim() || null;
  const isFeatured = formData.get("is_featured") === "on";

  if (!title) return { success: false, error: "Title is required" };

  const slugFinal = slugInput ? slugify(slugInput) : slugifyShort(title);
  if (!slugFinal) return { success: false, error: "Slug is required" };

  const { data: dup } = await supabase
    .from("pathways")
    .select("id")
    .eq("slug", slugFinal)
    .neq("id", id)
    .maybeSingle();

  if (dup) return { success: false, error: "Slug is already in use" };

  const { data: prev } = await supabase.from("pathways").select("slug").eq("id", id).maybeSingle();

  const { error } = await supabase
    .from("pathways")
    .update({
      title,
      slug: slugFinal,
      description,
      category_id: categoryId,
      target_audience: targetAudience,
      difficulty,
      estimated_duration_text: estimatedDurationText,
      is_featured: isFeatured,
    })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    console.error("updatePathway error:", error);
    return { success: false, error: "Could not update pathway" };
  }

  revalidatePathwayPaths(prev?.slug as string | undefined);
  revalidatePath(`/admin/pathways/${id}/edit`);
  return { success: true };
}

export async function publishPathway(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: row } = await supabase.from("pathways").select("slug").eq("id", id).eq("author_id", user.id).maybeSingle();
  if (!row) return { success: false, error: "Pathway not found" };

  const structure = await serializeLivePathwayStructure(supabase, id);
  const publishedAt = new Date().toISOString();

  const { error } = await supabase
    .from("pathways")
    .update({
      status: "published",
      published_at: publishedAt,
      published_structure: structure as unknown as Record<string, unknown>,
    })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not publish" };

  await deleteTombstonedStructureRows(supabase, id);

  revalidatePathwayPaths(row?.slug as string | undefined);
  revalidatePath(`/admin/pathways/${id}/edit`);
  return { success: true };
}

export async function publishPathwayWithChanges(id: string, formData: FormData): Promise<ActionResult> {
  const updateResult = await updatePathway(id, formData);
  if (!updateResult.success) return updateResult;
  return publishPathway(id);
}

export async function unpublishPathway(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: row } = await supabase.from("pathways").select("slug").eq("id", id).eq("author_id", user.id).maybeSingle();

  if (!row) return { success: false, error: "Pathway not found" };

  await deleteTombstonedStructureRows(supabase, id);

  const { error } = await supabase
    .from("pathways")
    .update({ status: "draft", published_at: null, published_structure: null })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { success: false, error: "Could not unpublish" };

  revalidatePathwayPaths(row.slug as string | undefined);
  revalidatePath(`/admin/pathways/${id}/edit`);
  return { success: true };
}

export async function deletePathway(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: row } = await supabase.from("pathways").select("slug").eq("id", id).eq("author_id", user.id).maybeSingle();

  const { error } = await supabase.from("pathways").delete().eq("id", id).eq("author_id", user.id);

  if (error) return { success: false, error: "Could not delete" };

  revalidatePathwayPaths(row?.slug as string | undefined);
  revalidatePath(`/admin/pathways/${id}/edit`);
  return { success: true };
}
