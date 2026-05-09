"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { success: false; error: string };

export async function markLessonComplete(
  courseId: string,
  lessonId: string,
  courseSlug: string,
  lessonSlug: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("course_progress").insert({
    user_id: user.id,
    course_id: courseId,
    lesson_id: lessonId,
  });

  if (error && error.code !== "23505") {
    console.error("Failed to mark lesson complete:", error);
    return { success: false, error: "Could not save progress. Please try again." };
  }

  revalidatePath(`/courses/${courseSlug}/${lessonSlug}`);
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath(`/courses`);

  return { success: true };
}

export async function unmarkLessonComplete(
  lessonId: string,
  courseSlug: string,
  lessonSlug: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("course_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId);

  if (error) {
    console.error("Failed to unmark lesson complete:", error);
    return { success: false, error: "Could not update progress. Please try again." };
  }

  revalidatePath(`/courses/${courseSlug}/${lessonSlug}`);
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath(`/courses`);

  return { success: true };
}
