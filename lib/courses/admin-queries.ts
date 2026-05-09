import { createClient } from "@/lib/supabase/server";

export type BlogCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type AdminCourseListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  target_audience: string | null;
  published_at: string | null;
  updated_at: string;
  author_id: string | null;
  category: { id: string; name: string } | null;
  lesson_count: number;
};

export type AdminCourseForEdit = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category_id: string | null;
  target_audience: "student" | "resident" | "practicing" | "all" | null;
  cover_image_url: string | null;
  cover_image_attribution: string | null;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
  author_id: string | null;
  learning_objectives: string[];
};

export type AdminLessonRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  estimated_minutes: number;
  order_index: number;
  updated_at: string;
  learning_objectives: string[];
};

export type AdminLessonForEdit = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  description: string | null;
  content: unknown;
  estimated_minutes: number;
  order_index: number;
  learning_objectives: string[];
};

/** Normalize jsonb / API learning_objectives to a string array. */
export function normalizeLearningObjectives(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((o): o is string => typeof o === "string")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function getBlogCategoriesForCourseForms(): Promise<BlogCategoryOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_categories").select("id, name, slug").order("name");
  if (error) {
    console.error("[courses admin] categories", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAdminCourses(userId: string, role: "admin" | "contributor"): Promise<AdminCourseListItem[]> {
  const supabase = await createClient();

  let q = supabase
    .from("courses")
    .select(
      `
      id,
      slug,
      title,
      description,
      status,
      target_audience,
      published_at,
      updated_at,
      author_id,
      category:blog_categories(id, name),
      lessons(count)
    `,
    )
    .order("updated_at", { ascending: false });

  if (role === "contributor") {
    q = q.eq("author_id", userId);
  }

  const { data, error } = await q;
  if (error) {
    console.error("[courses admin] list", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      slug: string;
      title: string;
      description: string | null;
      status: string;
      target_audience: string | null;
      published_at: string | null;
      updated_at: string;
      author_id: string | null;
      category: { id: string; name: string } | { id: string; name: string }[] | null;
      lessons: { count: number }[] | null;
    };

    const category = single(r.category);
    const lessonsEmbed = Array.isArray(r.lessons) ? r.lessons[0] : null;
    const lesson_count = lessonsEmbed?.count ?? 0;

    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      status: r.status === "published" ? "published" : "draft",
      target_audience: r.target_audience,
      published_at: r.published_at,
      updated_at: r.updated_at,
      author_id: r.author_id,
      category,
      lesson_count,
    };
  });
}

export async function getCourseForEdit(courseId: string): Promise<AdminCourseForEdit | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, slug, title, description, category_id, target_audience, cover_image_url, cover_image_attribution, status, published_at, updated_at, author_id, learning_objectives",
    )
    .eq("id", courseId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[courses admin] getCourseForEdit", error.message);
    return null;
  }

  const row = data as unknown as {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    category_id: string | null;
    target_audience: string | null;
    cover_image_url: string | null;
    cover_image_attribution: string | null;
    status: string;
    published_at: string | null;
    updated_at: string;
    author_id: string | null;
    learning_objectives: unknown;
  };

  const ta = row.target_audience;
  const audience: AdminCourseForEdit["target_audience"] =
    ta === "student" || ta === "resident" || ta === "practicing" || ta === "all" ? ta : null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category_id: row.category_id,
    target_audience: audience,
    cover_image_url: row.cover_image_url,
    cover_image_attribution: row.cover_image_attribution,
    status: row.status === "published" ? "published" : "draft",
    published_at: row.published_at,
    updated_at: row.updated_at,
    author_id: row.author_id,
    learning_objectives: normalizeLearningObjectives(row.learning_objectives),
  };
}

export async function getLessonsForCourseAdmin(courseId: string): Promise<AdminLessonRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, slug, title, description, estimated_minutes, order_index, updated_at, learning_objectives")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("[courses admin] lessons list", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      ...(row as AdminLessonRow),
      learning_objectives: normalizeLearningObjectives(r.learning_objectives),
    };
  });
}

export async function getLessonForEdit(courseId: string, lessonId: string): Promise<AdminLessonForEdit | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, course_id, slug, title, description, content, estimated_minutes, order_index, learning_objectives")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[courses admin] getLessonForEdit", error.message);
    return null;
  }

  const row = data as unknown as AdminLessonForEdit & { learning_objectives: unknown };

  return {
    ...row,
    learning_objectives: normalizeLearningObjectives(row.learning_objectives),
  };
}

export async function countLessonsForCourse(courseId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);

  if (error) {
    console.error("[courses admin] countLessons", error.message);
    return 0;
  }
  return count ?? 0;
}
