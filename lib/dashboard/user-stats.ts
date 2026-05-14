import { createClient } from "@/lib/supabase/server";

export type UserDashboardStats = {
  questionsAnswered: number;
  quizzesCompleted: number;
  flashcardsReviewed: number;
  lessonsCompleted: number;
};

/**
 * Learner dashboard metrics — simple counts from existing tables (no trends).
 */
export async function getUserDashboardStats(userId: string): Promise<UserDashboardStats> {
  const supabase = await createClient();

  const [qrCount, attemptsRes, reviewsRes, cpCount] = await Promise.all([
    supabase.from("question_responses").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("quiz_attempts").select("quiz_id").eq("user_id", userId).eq("status", "submitted"),
    supabase.from("flashcard_reviews").select("flashcard_id").eq("user_id", userId),
    supabase.from("course_progress").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  if (qrCount.error) console.error("[dashboard] question_responses count", qrCount.error.message);
  if (attemptsRes.error) console.error("[dashboard] quiz_attempts list", attemptsRes.error.message);
  if (reviewsRes.error) console.error("[dashboard] flashcard_reviews list", reviewsRes.error.message);
  if (cpCount.error) console.error("[dashboard] course_progress count", cpCount.error.message);

  const questionsAnswered = qrCount.count ?? 0;
  const lessonsCompleted = cpCount.count ?? 0;
  const quizzesCompleted = new Set((attemptsRes.data ?? []).map((r) => String(r.quiz_id))).size;
  const flashcardsReviewed = new Set((reviewsRes.data ?? []).map((r) => String(r.flashcard_id))).size;

  return {
    questionsAnswered,
    quizzesCompleted,
    flashcardsReviewed,
    lessonsCompleted,
  };
}
