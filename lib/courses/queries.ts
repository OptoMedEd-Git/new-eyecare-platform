import { createClient } from "@/lib/supabase/server";

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
