import { createClient } from "@/lib/supabase/server";

import { getPublicPathwayModules } from "./queries";
import { usesManualPathwayCompletion } from "./manual-completion";
import type { PathwayModuleType, PublicPathwayModuleRow } from "./types";

export type ModuleCompletionSource =
  | "course_progress"
  | "quiz_attempt"
  | "flashcard_reviews"
  | "blog_view"
  | "manual"
  | "none";

export type ModuleCompletionState = {
  module_id: string;
  is_complete: boolean;
  source: ModuleCompletionSource;
};

async function checkCourseCompletion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  courseId: string,
): Promise<{ is_complete: boolean; source: ModuleCompletionSource }> {
  const { data: lessons, error: leErr } = await supabase.from("lessons").select("id").eq("course_id", courseId);
  if (leErr || !lessons?.length) {
    return { is_complete: true, source: "course_progress" };
  }

  const { data: progress, error: pErr } = await supabase
    .from("course_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (pErr) {
    return { is_complete: false, source: "none" };
  }

  const done = new Set((progress ?? []).map((r) => String(r.lesson_id)));
  const allDone = lessons.every((l) => done.has(String(l.id)));
  return { is_complete: allDone, source: "course_progress" };
}

async function checkQuizCompletion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  quizId: string,
): Promise<{ is_complete: boolean; source: ModuleCompletionSource }> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id")
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .eq("status", "submitted")
    .limit(1)
    .maybeSingle();

  if (error) {
    return { is_complete: false, source: "none" };
  }
  return { is_complete: Boolean(data), source: "quiz_attempt" };
}

async function checkFlashcardDeckCompletion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  deckId: string,
): Promise<{ is_complete: boolean; source: ModuleCompletionSource }> {
  const { data: items, error: iErr } = await supabase
    .from("flashcard_deck_items")
    .select("flashcard_id")
    .eq("deck_id", deckId);

  if (iErr || !items?.length) {
    return { is_complete: true, source: "flashcard_reviews" };
  }

  const cardIds = items.map((r) => String(r.flashcard_id));
  const { data: reviews, error: rErr } = await supabase
    .from("flashcard_reviews")
    .select("flashcard_id")
    .eq("user_id", userId)
    .in("flashcard_id", cardIds);

  if (rErr) {
    return { is_complete: false, source: "none" };
  }

  const reviewed = new Set((reviews ?? []).map((r) => String(r.flashcard_id)));
  const allDone = cardIds.every((id) => reviewed.has(id));
  return { is_complete: allDone, source: "flashcard_reviews" };
}

async function checkManualModuleCompletion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  moduleId: string,
): Promise<{ is_complete: boolean; source: ModuleCompletionSource }> {
  const { data, error } = await supabase
    .from("pathway_module_completions")
    .select("id")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (error) {
    return { is_complete: false, source: "none" };
  }
  return { is_complete: Boolean(data), source: "manual" };
}

async function completionForModule(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  m: PublicPathwayModuleRow,
): Promise<ModuleCompletionState> {
  if (m.is_orphaned) {
    return { module_id: m.id, is_complete: false, source: "none" };
  }

  const type = m.module_type as PathwayModuleType;

  if (usesManualPathwayCompletion(type)) {
    const r = await checkManualModuleCompletion(supabase, userId, m.id);
    return { module_id: m.id, is_complete: r.is_complete, source: r.source };
  }

  switch (type) {
    case "course": {
      if (!m.linked_course_id) {
        return { module_id: m.id, is_complete: false, source: "none" };
      }
      const r = await checkCourseCompletion(supabase, userId, m.linked_course_id);
      return { module_id: m.id, is_complete: r.is_complete, source: r.source };
    }
    case "quiz": {
      if (!m.linked_quiz_id) {
        return { module_id: m.id, is_complete: false, source: "none" };
      }
      const r = await checkQuizCompletion(supabase, userId, m.linked_quiz_id);
      return { module_id: m.id, is_complete: r.is_complete, source: r.source };
    }
    case "flashcard_deck": {
      if (!m.linked_flashcard_deck_id) {
        return { module_id: m.id, is_complete: false, source: "none" };
      }
      const r = await checkFlashcardDeckCompletion(supabase, userId, m.linked_flashcard_deck_id);
      return { module_id: m.id, is_complete: r.is_complete, source: r.source };
    }
    default:
      return { module_id: m.id, is_complete: false, source: "none" };
  }
}

/**
 * For each module in the pathway, compute completion state for the given user.
 * Internal types are derived from source tables on every call.
 * External resources and blog posts use pathway_module_completions (manual).
 *
 * Orphaned modules always return is_complete: false, source: "none".
 */
export async function getModuleCompletions(pathwayId: string, userId: string): Promise<ModuleCompletionState[]> {
  const supabase = await createClient();
  const modules = await getPublicPathwayModules(pathwayId);
  return Promise.all(modules.map((m) => completionForModule(supabase, userId, m)));
}
