"use server";

import { revalidatePath } from "next/cache";

import { ensureUniqueSlug, slugify } from "@/lib/blog/slugify";
import { deleteBlogImage } from "@/lib/blog/upload-image";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

type AuthoringRole = "admin" | "contributor";

type TargetAudience = "student" | "resident" | "practicing" | "all";

type ProfileRoleRow = {
  role: "admin" | "contributor" | "member";
};

type AuthedContext = {
  user: { id: string; user_metadata?: Record<string, unknown> };
  role: AuthoringRole;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Parse the tag_ids field from FormData. Returns:
 * - undefined if the key is absent (don't touch tags)
 * - an array of UUIDs (validated, deduped) if the key is present
 * - throws if the JSON is malformed or any entry is not a valid UUID
 */
function parseTagIds(formData: FormData): string[] | undefined {
  if (!formData.has("tag_ids")) return undefined;
  const raw = formData.get("tag_ids");
  if (typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (trimmed === "") return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("tag_ids must be valid JSON");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("tag_ids must be a JSON array");
  }

  const ids = new Set<string>();
  for (const entry of parsed) {
    if (typeof entry !== "string" || !isUuid(entry)) {
      throw new Error("tag_ids must contain only valid UUIDs");
    }
    ids.add(entry);
  }
  return Array.from(ids);
}

/**
 * Replace all tag associations for a post with the given list.
 * - Deletes all existing rows in blog_post_tags for this post
 * - Inserts new rows for each tagId
 * - Tags array can be empty (results in no rows)
 *
 * Uses the user's session (RLS enforced). Returns success or throws.
 */
async function replacePostTags(ctx: AuthedContext, postId: string, tagIds: string[]): Promise<void> {
  const { error: delError } = await ctx.supabase.from("blog_post_tags").delete().eq("post_id", postId);
  if (delError) throw new Error(`Failed to clear existing tags: ${delError.message}`);

  if (tagIds.length === 0) return;

  const rows = tagIds.map((tag_id) => ({ post_id: postId, tag_id }));
  const { error: insError } = await ctx.supabase.from("blog_post_tags").insert(rows);
  if (insError) {
    const code = (insError as { code?: unknown }).code;
    if (code === "23503") throw new Error("One or more selected tags no longer exist");
    if (code === "23505") throw new Error("Duplicate tag selection");
    throw new Error(`Failed to insert tags: ${insError.message}`);
  }
}

function getString(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : "";
}

function getNullableString(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseContentJson(contentRaw: string): unknown {
  try {
    return JSON.parse(contentRaw);
  } catch {
    throw new Error("Content must be valid JSON");
  }
}

async function getCurrentUserAndRole(): Promise<AuthedContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<ProfileRoleRow>();

  if (error || !profile) throw new Error("Profile not found");
  if (profile.role !== "admin" && profile.role !== "contributor") {
    throw new Error("Insufficient permissions");
  }

  return { user, role: profile.role, supabase };
}

async function authorizePostAccess(
  postId: string,
  ctx: AuthedContext
): Promise<{
  id: string;
  slug: string;
  title: string;
  author_id: string | null;
  cover_image_path: string | null;
}> {
  const { data: post, error } = await ctx.supabase
    .from("blog_posts")
    .select("id, slug, title, author_id, cover_image_path")
    .eq("id", postId)
    .maybeSingle<{
      id: string;
      slug: string;
      title: string;
      author_id: string | null;
      cover_image_path: string | null;
    }>();

  if (error || !post) throw new Error("Post not found");
  if (ctx.role === "contributor" && post.author_id !== ctx.user.id) {
    throw new Error("You don't have permission to edit this post");
  }
  return post;
}

async function slugExists(ctx: AuthedContext, slug: string, excludeId?: string): Promise<boolean> {
  let q = ctx.supabase.from("blog_posts").select("id").eq("slug", slug).limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data, error } = await q;
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

function mapPostgresUniqueViolationToMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: unknown }).code;
    if (code === "23505") return "A post with this slug already exists.";
  }
  return fallback;
}

export async function createPost(formData: FormData): Promise<ActionResult<{ postId: string }>> {
  try {
    const ctx = await getCurrentUserAndRole();

    let tagIds: string[] | undefined;
    try {
      tagIds = parseTagIds(formData);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid tags";
      return { ok: false, error: message, fieldErrors: { tag_ids: "Invalid tag selection" } };
    }

    const titleRaw = getString(formData, "title");
    const descriptionRaw = getString(formData, "description");
    const categoryId = getString(formData, "category_id");
    const contentRaw = getString(formData, "content");
    const coverImageUrl = getNullableString(formData, "cover_image_url");
    const coverImagePath = getNullableString(formData, "cover_image_path");
    const coverImageAttribution = formData.get("cover_image_attribution");
    const coverImageAttributionValue = isNonEmptyString(coverImageAttribution)
      ? coverImageAttribution.trim()
      : null;
    const targetAudience = formData.get("target_audience");
    const targetAudienceValue: TargetAudience | null =
      isNonEmptyString(targetAudience) &&
      (["student", "resident", "practicing", "all"] as const).includes(targetAudience as TargetAudience)
        ? (targetAudience as TargetAudience)
        : null;

    const fieldErrors: Record<string, string> = {};

    if (!isNonEmptyString(titleRaw)) fieldErrors.title = "Title is required";
    if (typeof titleRaw === "string" && titleRaw.length > 200) fieldErrors.title = "Title too long";

    const description = descriptionRaw ?? "";
    if (description.length > 500) fieldErrors.description = "Description too long";

    if (!isNonEmptyString(categoryId) || !isUuid(categoryId)) fieldErrors.category_id = "Invalid category";
    if (!isNonEmptyString(contentRaw)) fieldErrors.content = "Content is required";

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "Validation failed", fieldErrors };
    }

    if (!isNonEmptyString(titleRaw)) {
      return { ok: false, error: "Validation failed", fieldErrors: { title: "Title is required" } };
    }
    if (!isNonEmptyString(categoryId) || !isUuid(categoryId)) {
      return { ok: false, error: "Validation failed", fieldErrors: { category_id: "Invalid category" } };
    }
    if (!isNonEmptyString(contentRaw)) {
      return { ok: false, error: "Validation failed", fieldErrors: { content: "Content is required" } };
    }

    const baseSlug = slugify(titleRaw);
    if (!baseSlug) {
      return { ok: false, error: "Validation failed", fieldErrors: { title: "Title must produce a valid slug" } };
    }

    const finalSlug = await ensureUniqueSlug(baseSlug, (s) => slugExists(ctx, s));
    const content = parseContentJson(contentRaw);

    const { data, error } = await ctx.supabase
      .from("blog_posts")
      .insert({
        title: titleRaw,
        slug: finalSlug,
        description,
        content,
        category_id: categoryId,
        author_id: ctx.user.id,
        status: "draft",
        published_at: null,
        cover_image_url: coverImageUrl,
        cover_image_path: coverImagePath,
        cover_image_attribution: coverImageAttributionValue,
        target_audience: targetAudienceValue,
      })
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error || !data) {
      const msg = mapPostgresUniqueViolationToMessage(error, error?.message ?? "Failed to create post");
      return { ok: false, error: msg };
    }

    // Persist tag associations if the caller submitted tag_ids (even if empty)
    if (tagIds !== undefined) {
      try {
        await replacePostTags(ctx, data.id, tagIds);
      } catch (e) {
        // Roll back the post creation to avoid orphaned posts with missing tag state.
        await ctx.supabase.from("blog_posts").delete().eq("id", data.id);
        const message = e instanceof Error ? e.message : "Failed to save tags";
        return { ok: false, error: message };
      }
    }

    revalidatePath("/admin/blog");
    return { ok: true, data: { postId: data.id } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post";
    return { ok: false, error: message };
  }
}

export async function updatePost(postId: string, formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    const existing = await authorizePostAccess(postId, ctx);

    let tagIds: string[] | undefined;
    try {
      tagIds = parseTagIds(formData);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid tags";
      return { ok: false, error: message, fieldErrors: { tag_ids: "Invalid tag selection" } };
    }

    const titleRaw = getString(formData, "title");
    const descriptionRaw = getString(formData, "description");
    const categoryIdRaw = getString(formData, "category_id");
    const contentRaw = getString(formData, "content");
    const coverImageUrl = getNullableString(formData, "cover_image_url");
    const coverImagePath = getNullableString(formData, "cover_image_path");
    const coverImageAttribution = formData.get("cover_image_attribution");
    const coverImageAttributionValue = isNonEmptyString(coverImageAttribution)
      ? coverImageAttribution.trim()
      : null;
    const slugOverrideRaw = getString(formData, "slug");
    const targetAudience = formData.get("target_audience");
    const targetAudienceValue: TargetAudience | null =
      isNonEmptyString(targetAudience) &&
      (["student", "resident", "practicing", "all"] as const).includes(targetAudience as TargetAudience)
        ? (targetAudience as TargetAudience)
        : null;

    const fieldErrors: Record<string, string> = {};

    if (titleRaw != null && titleRaw.length > 200) fieldErrors.title = "Title too long";
    if (descriptionRaw != null && descriptionRaw.length > 500) fieldErrors.description = "Description too long";
    if (categoryIdRaw != null && categoryIdRaw !== "" && !isUuid(categoryIdRaw)) fieldErrors.category_id = "Invalid category";
    if (isNonEmptyString(slugOverrideRaw)) {
      const s = slugify(slugOverrideRaw);
      if (!s) fieldErrors.slug = "Slug must be URL-safe";
    }
    if (formData.has("content")) {
      if (!isNonEmptyString(contentRaw)) {
        fieldErrors.content = "Content is required";
      } else {
        try {
          parseContentJson(contentRaw);
        } catch (e) {
          fieldErrors.content = e instanceof Error ? e.message : "Content must be valid JSON";
        }
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "Validation failed", fieldErrors };
    }

    const title = titleRaw ?? undefined;
    const description = descriptionRaw ?? undefined;
    const category_id = categoryIdRaw ?? undefined;
    const cover_image_url = coverImageUrl;
    const cover_image_path = coverImagePath;

    let nextSlug: string | undefined;
    const hasTitle = typeof title === "string";
    const titleChanged = hasTitle && title.trim() !== "" && title.trim() !== existing.title.trim();

    if (isNonEmptyString(slugOverrideRaw)) {
      const base = slugify(slugOverrideRaw);
      if (!base) {
        return { ok: false, error: "Validation failed", fieldErrors: { slug: "Slug must be URL-safe" } };
      }
      nextSlug = await ensureUniqueSlug(base, (s) => slugExists(ctx, s, postId));
    } else if (titleChanged) {
      if (!isNonEmptyString(titleRaw)) {
        return { ok: false, error: "Validation failed", fieldErrors: { title: "Title is required" } };
      }
      const base = slugify(titleRaw);
      if (!base) {
        return { ok: false, error: "Validation failed", fieldErrors: { title: "Title must produce a valid slug" } };
      }
      nextSlug = await ensureUniqueSlug(base, (s) => slugExists(ctx, s, postId));
    }

    const parsedContent = formData.has("content") && isNonEmptyString(contentRaw) ? parseContentJson(contentRaw) : undefined;

    const updatePayload: Record<string, unknown> = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(category_id !== undefined ? { category_id } : {}),
      cover_image_url,
      cover_image_path,
      cover_image_attribution: coverImageAttributionValue,
      target_audience: targetAudienceValue,
      ...(nextSlug ? { slug: nextSlug } : {}),
    };

    // If content key wasn't present, avoid overwriting.
    if (parsedContent !== undefined) updatePayload.content = parsedContent;
    if (!formData.has("cover_image_url")) {
      delete updatePayload.cover_image_url;
    }
    if (!formData.has("cover_image_path")) {
      delete updatePayload.cover_image_path;
    }
    if (!formData.has("cover_image_attribution")) {
      delete updatePayload.cover_image_attribution;
    }
    if (!formData.has("target_audience")) {
      delete updatePayload.target_audience;
    }

    const oldCoverPath = existing.cover_image_path;
    const newCoverPath = formData.has("cover_image_path") ? coverImagePath : oldCoverPath;
    const coverPathChanged = oldCoverPath && newCoverPath !== oldCoverPath;
    const coverPathRemoved = oldCoverPath && newCoverPath == null;

    const { error } = await ctx.supabase.from("blog_posts").update(updatePayload).eq("id", postId);

    if (error) {
      const msg = mapPostgresUniqueViolationToMessage(error, error.message ?? "Failed to update post");
      return { ok: false, error: msg };
    }

    if (coverPathChanged || coverPathRemoved) {
      try {
        await deleteBlogImage(oldCoverPath);
      } catch (cleanupErr) {
        console.warn("[blog] updatePost cover image cleanup failed", cleanupErr);
      }
    }

    // Sync tag associations IF the caller submitted tag_ids (even if empty)
    if (tagIds !== undefined) {
      try {
        await replacePostTags(ctx, postId, tagIds);
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : "Failed to sync tags (post was updated, but tags were not changed)";
        return { ok: false, error: message };
      }
    }

    const finalSlugForRevalidate = nextSlug ?? existing.slug;

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${finalSlugForRevalidate}`);

    return { ok: true, data: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update post";
    return { ok: false, error: message };
  }
}

export async function publishPost(postId: string): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    await authorizePostAccess(postId, ctx);

    const { data: post, error } = await ctx.supabase
      .from("blog_posts")
      .select("id, slug, title, description, content, category_id, cover_image_url, cover_image_attribution")
      .eq("id", postId)
      .maybeSingle<{
        id: string;
        slug: string;
        title: string;
        description: string;
        content: unknown;
        category_id: string;
        cover_image_url: string | null;
        cover_image_attribution: string | null;
      }>();

    if (error || !post) throw new Error("Post not found");

    const missing: string[] = [];
    if (!post.title?.trim()) missing.push("title");
    if (!post.description?.trim()) missing.push("description");
    if (!post.category_id) missing.push("category");
    if (!post.cover_image_url) missing.push("cover image");
    if (!post.cover_image_attribution?.trim()) missing.push("image attribution");
    if (post.content == null) missing.push("content");

    if (missing.length > 0) {
      return { ok: false, error: `Cannot publish: missing ${missing.join(", ")}` };
    }

    const { error: publishError } = await ctx.supabase
      .from("blog_posts")
      .update({ published_at: new Date().toISOString(), status: "published" })
      .eq("id", postId);

    if (publishError) {
      return { ok: false, error: publishError.message ?? "Failed to publish post" };
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);

    return { ok: true, data: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to publish post";
    return { ok: false, error: message };
  }
}

export async function unpublishPost(postId: string): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    const post = await authorizePostAccess(postId, ctx);

    const { error } = await ctx.supabase
      .from("blog_posts")
      .update({ published_at: null, status: "draft" })
      .eq("id", postId);

    if (error) {
      return { ok: false, error: error.message ?? "Failed to unpublish post" };
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);

    return { ok: true, data: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to unpublish post";
    return { ok: false, error: message };
  }
}

export async function deletePost(postId: string): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    const post = await authorizePostAccess(postId, ctx);

    if (post.cover_image_path) {
      try {
        await deleteBlogImage(post.cover_image_path);
      } catch (cleanupErr) {
        console.warn("[blog] deletePost cover image cleanup failed", cleanupErr);
      }
    }

    const { error } = await ctx.supabase.from("blog_posts").delete().eq("id", postId);
    if (error) {
      return { ok: false, error: error.message ?? "Failed to delete post" };
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");

    return { ok: true, data: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete post";
    return { ok: false, error: message };
  }
}

