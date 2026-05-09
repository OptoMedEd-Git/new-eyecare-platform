"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, Undo2 } from "lucide-react";

import { markLessonComplete, unmarkLessonComplete } from "@/app/(app)/courses/actions";
import type { Lesson } from "@/lib/courses/types";

type Props = {
  lesson: Lesson;
  courseId: string;
  courseSlug: string;
  isCompleted: boolean;
  nextLesson: Lesson | null;
};

export function MarkCompleteCheckpoint({
  lesson,
  courseId,
  courseSlug,
  isCompleted,
  nextLesson,
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
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-bg-brand text-text-on-brand">
              <Check className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-bold text-text-heading">Lesson complete</h3>
              <button
                type="button"
                onClick={handleUnmark}
                disabled={isPending}
                className="mt-1 inline-flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-text-heading disabled:opacity-50"
              >
                <Undo2 className="size-3" aria-hidden />
                Mark incomplete
              </button>
            </div>
          </div>
          {nextLesson ? (
            <Link
              href={`/courses/${courseSlug}/${nextLesson.slug}`}
              className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
            >
              Next: {nextLesson.title}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <Link
              href={`/courses/${courseSlug}`}
              className="inline-flex items-center gap-2 rounded-base border border-border-default px-5 py-2.5 text-sm font-medium text-text-body hover:bg-bg-secondary-soft"
            >
              Back to course overview
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-text-fg-danger">{error}</p> : null}
    </section>
  );
}
