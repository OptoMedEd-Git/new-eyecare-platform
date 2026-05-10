"use client";

import { useState, useTransition } from "react";
import { Check, Undo2 } from "lucide-react";

import { markLessonComplete, unmarkLessonComplete } from "@/app/(app)/courses/actions";
import type { Lesson } from "@/lib/courses/types";

type Props = {
  lesson: Lesson;
  courseId: string;
  courseSlug: string;
  isCompleted: boolean;
};

export function MarkCompleteCheckpoint({
  lesson,
  courseId,
  courseSlug,
  isCompleted,
}: Props) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(isCompleted);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleMarkComplete() {
    setError(null);
    setOptimisticCompleted(true);

    startTransition(async () => {
      const result = await markLessonComplete(courseId, lesson.id, courseSlug, lesson.slug);
      if (!result.success) {
        setOptimisticCompleted(false);
        setError(result.error);
      }
    });
  }

  function handleUnmark() {
    setError(null);
    setOptimisticCompleted(false);

    startTransition(async () => {
      const result = await unmarkLessonComplete(lesson.id, courseSlug, lesson.slug);
      if (!result.success) {
        setOptimisticCompleted(true);
        setError(result.error);
      }
    });
  }

  return (
    <section className="mt-12 rounded-base border border-border-default bg-bg-primary-soft p-6">
      {!optimisticCompleted ? (
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-heading">Finished this lesson?</h3>
            <p className="mt-1 text-sm text-text-body">Mark it complete to track your progress.</p>
          </div>
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="size-4" aria-hidden />
            Mark complete
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-brand text-text-on-brand">
              <Check className="size-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-heading">Lesson complete</h2>
              <p className="mt-0.5 text-sm text-text-body">Your progress has been saved.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUnmark}
            disabled={isPending}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <Undo2 className="size-4" aria-hidden />
            Mark incomplete
          </button>
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-text-fg-danger">{error}</p> : null}
    </section>
  );
}
