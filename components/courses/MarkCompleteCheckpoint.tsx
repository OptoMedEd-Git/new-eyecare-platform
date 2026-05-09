"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import type { SampleLesson } from "@/lib/courses/sample-data";

type Props = {
  lesson: SampleLesson;
  courseSlug: string;
  nextLesson: SampleLesson | null;
};

export function MarkCompleteCheckpoint({ lesson, courseSlug, nextLesson }: Props) {
  const [completed, setCompleted] = useState(lesson.status === "completed");

  function handleMarkComplete() {
    setCompleted(true);
  }

  return (
    <section className="mt-12 rounded-base border border-border-default bg-bg-primary-soft p-6">
      {!completed ? (
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-heading">Finished this lesson?</h3>
            <p className="mt-1 text-sm text-text-body">Mark it complete to track your progress.</p>
          </div>
          <button
            type="button"
            onClick={handleMarkComplete}
            className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
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
              <p className="mt-1 text-sm text-text-body">Great work.</p>
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
    </section>
  );
}
