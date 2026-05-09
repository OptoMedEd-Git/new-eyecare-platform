"use server";

import { revalidatePath } from "next/cache";

import { ensureUniqueSlug, slugify } from "@/lib/blog/slugify";
import { countLessonsForCourse } from "@/lib/courses/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

type AuthoringRole = "admin" | "contributor";

type ProfileRoleRow = {
  role: "admin" | "contributor" | "member";
};

type AuthedContext = {
  user: { id: string };
  role: AuthoringRole;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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

/**
 * Courses RLS only allows the author to mutate rows. Enforce ownership for all roles
 * so failures match user expectations (vs opaque RLS errors).
 */
async function authorizeCourseWrite(ctx: AuthedContext, courseId: string): Promise<{ id: string; author_id: string | null }> {
  const { data: course, error } = await ctx.supabase
    .from("courses")
    .select("id, author_id")
    .eq("id", courseId)
    .maybeSingle<{ id: string; author_id: string | null }>();

  if (error || !course) throw new Error("Course not found");
  if (course.author_id !== ctx.user.id) {
    throw new Error("You can only manage courses you created.");
  }
  return course;
}

async function courseSlugExists(ctx: AuthedContext, slug: string, excludeId?: string): Promise<boolean> {
  let q = ctx.supabase.from("courses").select("id").eq("slug", slug).limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data, error } = await q;
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

async function lessonSlugExists(ctx: AuthedContext, courseId: string, slug: string, excludeLessonId?: string): Promise<boolean> {
  let q = ctx.supabase.from("lessons").select("id").eq("course_id", courseId).eq("slug", slug).limit(1);
  if (excludeLessonId) q = q.neq("id", excludeLessonId);
  const { data, error } = await q;
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

function mapUniqueViolation(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: unknown }).code;
    if (code === "23505") return "This slug is already in use.";
  }
  return fallback;
}

function revalidateCourseAdmin(courseId: string) {
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath(`/admin/courses/${courseId}/lessons`);
}

export async function createCourse(formData: FormData): Promise<ActionResult<{ courseId: string }>> {
  try {
    const ctx = await getCurrentUserAndRole();

    const titleRaw = getString(formData, "title");
    const descriptionRaw = getString(formData, "description");
    const categoryId = getString(formData, "category_id");
    const targetAudience = formData.get("target_audience");

    const fieldErrors: Record<string, string> = {};

    if (!isNonEmptyString(titleRaw)) fieldErrors.title = "Title is required";
    if (typeof titleRaw === "string" && titleRaw.length > 200) fieldErrors.title = "Title too long";

    const description = descriptionRaw ?? "";
    if (description.length > 2000) fieldErrors.description = "Description too long";

    if (!isNonEmptyString(categoryId) || !isUuid(categoryId)) fieldErrors.category_id = "Invalid category";

    const AUDIENCES = ["student", "resident", "practicing", "all"] as const;
    const targetAudienceValue: (typeof AUDIENCES)[number] | null =
      isNonEmptyString(targetAudience) && AUDIENCES.includes(targetAudience as (typeof AUDIENCES)[number])
        ? (targetAudience as (typeof AUDIENCES)[number])
        : null;

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "Validation failed", fieldErrors };
    }

    const baseSlug = slugify(titleRaw!);
    if (!baseSlug) {
      return { ok: false, error: "Validation failed", fieldErrors: { title: "Title must produce a valid slug" } };
    }

    const finalSlug = await ensureUniqueSlug(baseSlug, (s) => courseSlugExists(ctx, s));

    const { data, error } = await ctx.supabase
      .from("courses")
      .insert({
        title: titleRaw!,
        slug: finalSlug,
        description: description || null,
        category_id: categoryId!,
        target_audience: targetAudienceValue,
        author_id: ctx.user.id,
        status: "draft",
        published_at: null,
      })
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error || !data) {
      return { ok: false, error: mapUniqueViolation(error, error?.message ?? "Failed to create course") };
    }

    revalidatePath("/admin/courses");
    return { ok: true, data: { courseId: data.id } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create course";
    return { ok: false, error: message };
  }
}

export async function updateCourse(courseId: string, formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    await authorizeCourseWrite(ctx, courseId);

    const titleRaw = getString(formData, "title");
    const slugRaw = getString(formData, "slug");
    const descriptionRaw = getString(formData, "description");
    const categoryId = getString(formData, "category_id");
    const coverImageUrl = getNullableString(formData, "cover_image_url");
    const coverImageAttributionRaw = formData.get("cover_image_attribution");
    const coverImageAttribution =
      typeof coverImageAttributionRaw === "string" && coverImageAttributionRaw.trim().length > 0
        ? coverImageAttributionRaw.trim()
        : null;
    const targetAudience = formData.get("target_audience");

    const fieldErrors: Record<string, string> = {};

    if (!isNonEmptyString(titleRaw)) fieldErrors.title = "Title is required";
    if (typeof titleRaw === "string" && titleRaw.length > 200) fieldErrors.title = "Title too long";

    if (!isNonEmptyString(slugRaw)) fieldErrors.slug = "Slug is required";
    if (typeof slugRaw === "string" && slugRaw.length > 120) fieldErrors.slug = "Slug too long";

    const description = descriptionRaw ?? "";
    if (description.length > 2000) fieldErrors.description = "Description too long";

    if (!isNonEmptyString(categoryId) || !isUuid(categoryId)) fieldErrors.category_id = "Invalid category";

    const AUDIENCES = ["student", "resident", "practicing", "all"] as const;
    const targetAudienceValue: (typeof AUDIENCES)[number] | null =
      isNonEmptyString(targetAudience) && AUDIENCES.includes(targetAudience as (typeof AUDIENCES)[number])
        ? (targetAudience as (typeof AUDIENCES)[number])
        : null;

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "Validation failed", fieldErrors };
    }

    const normalizedSlug = slugRaw!
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    if (!normalizedSlug) {
      return { ok: false, error: "Validation failed", fieldErrors: { slug: "Slug cannot be empty" } };
    }

    const { error } = await ctx.supabase
      .from("courses")
      .update({
        title: titleRaw!,
        slug: normalizedSlug,
        description: description || null,
        category_id: categoryId!,
        target_audience: targetAudienceValue,
        cover_image_url: coverImageUrl,
        cover_image_attribution: coverImageAttribution,
      })
      .eq("id", courseId);

    if (error) {
      return { ok: false, error: mapUniqueViolation(error, error.message ?? "Failed to update course") };
    }

    revalidateCourseAdmin(courseId);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update course";
    return { ok: false, error: message };
  }
}

export async function deleteCourse(courseId: string): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    await authorizeCourseWrite(ctx, courseId);

    const { error } = await ctx.supabase.from("courses").delete().eq("id", courseId);
    if (error) {
      return { ok: false, error: error.message ?? "Failed to delete course" };
    }

    revalidatePath("/admin/courses");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete course";
    return { ok: false, error: message };
  }
}

export async function publishCourse(courseId: string): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    await authorizeCourseWrite(ctx, courseId);

    const { data: row, error: fetchError } = await ctx.supabase
      .from("courses")
      .select("cover_image_url, cover_image_attribution")
      .eq("id", courseId)
      .maybeSingle<{
        cover_image_url: string | null;
        cover_image_attribution: string | null;
      }>();

    if (fetchError || !row) {
      return { ok: false, error: "Could not load course" };
    }

    const n = await countLessonsForCourse(courseId);
    if (n < 1) {
      return { ok: false, error: "Add at least one lesson before publishing." };
    }

    const attributionOk = typeof row.cover_image_attribution === "string" && row.cover_image_attribution.trim().length > 0;
    const coverUrlOk = typeof row.cover_image_url === "string" && row.cover_image_url.trim().length > 0;
    if (!attributionOk || !coverUrlOk) {
      return {
        ok: false,
        error: "Add a cover image and attribution before publishing.",
      };
    }

    const publishedAt = new Date().toISOString();

    const { error } = await ctx.supabase
      .from("courses")
      .update({
        status: "published",
        published_at: publishedAt,
      })
      .eq("id", courseId);

    if (error) {
      return { ok: false, error: error.message ?? "Failed to publish" };
    }

    revalidateCourseAdmin(courseId);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to publish";
    return { ok: false, error: message };
  }
}

export async function unpublishCourse(courseId: string): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    await authorizeCourseWrite(ctx, courseId);

    const { error } = await ctx.supabase
      .from("courses")
      .update({
        status: "draft",
        published_at: null,
      })
      .eq("id", courseId);

    if (error) {
      return { ok: false, error: error.message ?? "Failed to unpublish" };
    }

    revalidateCourseAdmin(courseId);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to unpublish";
    return { ok: false, error: message };
  }
}

export async function createLesson(courseId: string, formData: FormData): Promise<ActionResult<{ lessonId: string }>> {
  try {
    const ctx = await getCurrentUserAndRole();
    await authorizeCourseWrite(ctx, courseId);

    const titleRaw = getString(formData, "title");
    const slugRaw = getString(formData, "slug");
    const descriptionRaw = getString(formData, "description");
    const estimatedRaw = getString(formData, "estimated_minutes");
    const contentRaw = getString(formData, "content");

    const fieldErrors: Record<string, string> = {};

    if (!isNonEmptyString(titleRaw)) fieldErrors.title = "Title is required";

    let estimated = 0;
    if (estimatedRaw != null && estimatedRaw !== "") {
      const parsed = Number.parseInt(estimatedRaw, 10);
      if (Number.isNaN(parsed) || parsed < 0) fieldErrors.estimated_minutes = "Enter a valid number of minutes";
      else estimated = parsed;
    }

    if (!isNonEmptyString(contentRaw)) fieldErrors.content = "Content is required";

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "Validation failed", fieldErrors };
    }

    let slugBase: string;
    if (isNonEmptyString(slugRaw)) {
      slugBase = slugify(slugRaw);
    } else {
      slugBase = slugify(titleRaw!);
    }

    if (!slugBase) {
      return { ok: false, error: "Validation failed", fieldErrors: { title: "Title must produce a valid slug" } };
    }

    const finalSlug = await ensureUniqueSlug(slugBase, (s) => lessonSlugExists(ctx, courseId, s));

    const { data: maxRow } = await ctx.supabase
      .from("lessons")
      .select("order_index")
      .eq("course_id", courseId)
      .order("order_index", { ascending: false })
      .limit(1)
      .maybeSingle<{ order_index: number }>();

    const nextOrder = (maxRow?.order_index ?? -1) + 1;

    const content = parseContentJson(contentRaw!);

    const { data, error } = await ctx.supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        slug: finalSlug,
        title: titleRaw!,
        description: descriptionRaw && descriptionRaw.length > 0 ? descriptionRaw : null,
        content,
        estimated_minutes: estimated,
        order_index: nextOrder,
      })
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error || !data) {
      return { ok: false, error: mapUniqueViolation(error, error?.message ?? "Failed to create lesson") };
    }

    revalidateCourseAdmin(courseId);
    return { ok: true, data: { lessonId: data.id } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create lesson";
    return { ok: false, error: message };
  }
}

export async function updateLesson(courseId: string, lessonId: string, formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    await authorizeCourseWrite(ctx, courseId);

    const titleRaw = getString(formData, "title");
    const slugRaw = getString(formData, "slug");
    const descriptionRaw = getString(formData, "description");
    const estimatedRaw = getString(formData, "estimated_minutes");
    const contentRaw = getString(formData, "content");

    const fieldErrors: Record<string, string> = {};

    if (!isNonEmptyString(titleRaw)) fieldErrors.title = "Title is required";

    if (!isNonEmptyString(slugRaw)) fieldErrors.slug = "Slug is required";
    const normalizedSlug = slugRaw
      ? slugRaw
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
      : "";
    if (!normalizedSlug) fieldErrors.slug = "Slug cannot be empty";

    let estimated = 0;
    if (estimatedRaw != null && estimatedRaw !== "") {
      const parsed = Number.parseInt(estimatedRaw, 10);
      if (Number.isNaN(parsed) || parsed < 0) fieldErrors.estimated_minutes = "Enter a valid number of minutes";
      else estimated = parsed;
    }

    if (!isNonEmptyString(contentRaw)) fieldErrors.content = "Content is required";

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "Validation failed", fieldErrors };
    }

    const exists = await lessonSlugExists(ctx, courseId, normalizedSlug, lessonId);
    if (exists) {
      return { ok: false, error: "This slug is already in use for another lesson in this course." };
    }

    const content = parseContentJson(contentRaw!);

    const { error } = await ctx.supabase
      .from("lessons")
      .update({
        title: titleRaw!,
        slug: normalizedSlug,
        description: descriptionRaw && descriptionRaw.length > 0 ? descriptionRaw : null,
        content,
        estimated_minutes: estimated,
      })
      .eq("id", lessonId)
      .eq("course_id", courseId);

    if (error) {
      return { ok: false, error: mapUniqueViolation(error, error.message ?? "Failed to update lesson") };
    }

    revalidateCourseAdmin(courseId);
    revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}/edit`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update lesson";
    return { ok: false, error: message };
  }
}

export async function deleteLesson(courseId: string, lessonId: string): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    await authorizeCourseWrite(ctx, courseId);

    const { error } = await ctx.supabase.from("lessons").delete().eq("id", lessonId).eq("course_id", courseId);

    if (error) {
      return { ok: false, error: error.message ?? "Failed to delete lesson" };
    }

    revalidateCourseAdmin(courseId);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete lesson";
    return { ok: false, error: message };
  }
}

export async function moveLesson(
  courseId: string,
  lessonId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    const ctx = await getCurrentUserAndRole();
    await authorizeCourseWrite(ctx, courseId);

    const { data: rows, error: listError } = await ctx.supabase
      .from("lessons")
      .select("id, order_index")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });

    if (listError || !rows?.length) {
      return { ok: false, error: "Could not load lessons" };
    }

    const ordered = rows as { id: string; order_index: number }[];
    const idx = ordered.findIndex((r) => r.id === lessonId);
    if (idx === -1) return { ok: false, error: "Lesson not found" };

    const neighborIdx = direction === "up" ? idx - 1 : idx + 1;
    if (neighborIdx < 0 || neighborIdx >= ordered.length) {
      return { ok: false, error: "Cannot move further in that direction" };
    }

    const a = ordered[idx]!;
    const b = ordered[neighborIdx]!;
    const maxOrder = Math.max(...ordered.map((r) => r.order_index));
    const temp = maxOrder + 1;

    const { error: e1 } = await ctx.supabase.from("lessons").update({ order_index: temp }).eq("id", a.id);
    if (e1) return { ok: false, error: e1.message ?? "Reorder failed" };

    const { error: e2 } = await ctx.supabase.from("lessons").update({ order_index: a.order_index }).eq("id", b.id);
    if (e2) return { ok: false, error: e2.message ?? "Reorder failed" };

    const { error: e3 } = await ctx.supabase.from("lessons").update({ order_index: b.order_index }).eq("id", a.id);
    if (e3) return { ok: false, error: e3.message ?? "Reorder failed" };

    revalidateCourseAdmin(courseId);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reorder";
    return { ok: false, error: message };
  }
}
