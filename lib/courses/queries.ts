import { createClient } from "@/lib/supabase/server";

import type { Course, CourseAudience, Lesson } from "./types";

export async function getCompletedLessonIdsForCourse(courseId: string): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("course_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  if (error) {
    console.error("Failed to fetch completed lessons:", error);
    return [];
  }

  return (data ?? []).map((row) => row.lesson_id as string);
}

export async function getCompletedLessonIdsForAllCourses(): Promise<Map<string, string[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Map();

  const { data, error } = await supabase.from("course_progress").select("course_id, lesson_id").eq("user_id", user.id);

  if (error) {
    console.error("Failed to fetch all completed lessons:", error);
    return new Map();
  }

  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    const cid = row.course_id as string;
    const lid = row.lesson_id as string;
    const existing = map.get(cid) ?? [];
    existing.push(lid);
    map.set(cid, existing);
  }
  return map;
}

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function rowToCourse(courseRow: Record<string, unknown>, lessonRows: Record<string, unknown>[]): Course {
  const lessons: Lesson[] = (lessonRows ?? []).map(
    (l): Lesson => ({
      id: l.id as string,
      courseId: l.course_id as string,
      slug: l.slug as string,
      title: l.title as string,
      description: (l.description as string | null) ?? null,
      content: l.content,
      estimatedMinutes: Number(l.estimated_minutes ?? 0),
      orderIndex: Number(l.order_index ?? 0),
      createdAt: l.created_at as string,
      updatedAt: l.updated_at as string,
    }),
  );

  lessons.sort((a, b) => a.orderIndex - b.orderIndex);

  const totalDurationMinutes = lessons.reduce((sum, le) => sum + le.estimatedMinutes, 0);

  const rawCat = courseRow.category;
  const catSingle = single(rawCat) as { id: string; name: string } | null;

  const ta = courseRow.target_audience as string | null;
  const audience: CourseAudience | null =
    ta === "student" || ta === "resident" || ta === "practicing" || ta === "all" ? ta : null;

  return {
    id: courseRow.id as string,
    slug: courseRow.slug as string,
    title: courseRow.title as string,
    description: (courseRow.description as string | null) ?? null,
    category: catSingle ? { id: catSingle.id, name: catSingle.name } : null,
    audience,
    coverImageUrl: (courseRow.cover_image_url as string | null) ?? null,
    coverImageAttribution: (courseRow.cover_image_attribution as string | null) ?? null,
    status: courseRow.status === "published" ? "published" : "draft",
    authorId: (courseRow.author_id as string | null) ?? null,
    publishedAt: (courseRow.published_at as string | null) ?? null,
    createdAt: courseRow.created_at as string,
    updatedAt: courseRow.updated_at as string,
    lessons,
    totalDurationMinutes,
  };
}

/**
 * Get all published courses with their lessons. Used by /courses index.
 */
export async function getPublishedCourses(): Promise<Course[]> {
  const supabase = await createClient();

  const { data: courseRows, error: courseErr } = await supabase
    .from("courses")
    .select(
      `
      *,
      category:blog_categories(id, name)
    `,
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (courseErr) {
    console.error("Failed to fetch published courses:", courseErr);
    return [];
  }

  if (!courseRows || courseRows.length === 0) return [];

  const courseIds = courseRows.map((c) => c.id as string);
  const { data: lessonRows, error: lessonErr } = await supabase
    .from("lessons")
    .select("*")
    .in("course_id", courseIds)
    .order("order_index", { ascending: true });

  if (lessonErr) {
    console.error("Failed to fetch lessons:", lessonErr);
    return [];
  }

  const lessonsByCourse = new Map<string, Record<string, unknown>[]>();
  for (const lesson of lessonRows ?? []) {
    const row = lesson as Record<string, unknown>;
    const cid = row.course_id as string;
    const list = lessonsByCourse.get(cid) ?? [];
    list.push(row);
    lessonsByCourse.set(cid, list);
  }

  return courseRows.map((c) =>
    rowToCourse(c as Record<string, unknown>, lessonsByCourse.get((c as { id: string }).id) ?? []),
  );
}

/**
 * Get a single published course by slug, with all its lessons.
 */
export async function getPublishedCourseBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient();

  const { data: courseRow, error: courseErr } = await supabase
    .from("courses")
    .select(
      `
      *,
      category:blog_categories(id, name)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (courseErr || !courseRow) {
    if (courseErr) console.error("Failed to fetch course:", courseErr);
    return null;
  }

  const { data: lessonRows, error: lessonErr } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseRow.id as string)
    .order("order_index", { ascending: true });

  if (lessonErr) {
    console.error("Failed to fetch lessons:", lessonErr);
    return null;
  }

  return rowToCourse(
    courseRow as Record<string, unknown>,
    (lessonRows ?? []) as Record<string, unknown>[],
  );
}

/**
 * Get a specific lesson by its slug + parent course slug.
 * Returns the lesson plus the parent course (with all sibling lessons for navigation).
 */
export async function getPublishedLessonByCourseAndSlug(
  courseSlug: string,
  lessonSlug: string,
): Promise<{ course: Course; lesson: Lesson } | null> {
  const course = await getPublishedCourseBySlug(courseSlug);
  if (!course) return null;

  const lesson = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return null;

  return { course, lesson };
}

/**
 * Compute previous/next lessons given a course and current lesson slug.
 */
export function getLessonNeighborsFromCourse(
  course: Course,
  lessonSlug: string,
): {
  previous: Lesson | null;
  next: Lesson | null;
  index: number;
  total: number;
} {
  const index = course.lessons.findIndex((l) => l.slug === lessonSlug);
  return {
    previous: index > 0 ? course.lessons[index - 1]! : null,
    next: index < course.lessons.length - 1 && index >= 0 ? course.lessons[index + 1]! : null,
    index,
    total: course.lessons.length,
  };
}
