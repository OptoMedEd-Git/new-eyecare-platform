"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Check, Clock, X } from "lucide-react";

import type { SampleCourse } from "@/lib/courses/sample-data";

type Props = {
  course: SampleCourse;
  currentLessonSlug: string;
  completedLessonIds: string[];
  isOpen: boolean;
  onClose: () => void;
};

export function LessonNavigatorDrawer({
  course,
  currentLessonSlug,
  completedLessonIds,
  isOpen,
  onClose,
}: Props) {
  const completedSet = new Set(completedLessonIds);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 xl:hidden" role="dialog" aria-modal="true" aria-label="Lesson navigator">
      <div className="absolute inset-0 bg-bg-inverse/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] overflow-y-auto bg-bg-primary-soft shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border-default bg-bg-primary-soft p-4">
          <h3 className="text-base font-bold text-text-heading">{course.title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lesson navigator"
            className="flex size-8 items-center justify-center rounded-sm text-text-muted hover:bg-bg-secondary-soft hover:text-text-heading"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <ol className="flex flex-col gap-1 p-4">
          {course.lessons.map((lesson, index) => {
            const isCurrent = lesson.slug === currentLessonSlug;
            const isCompleted = completedSet.has(lesson.id);

            return (
              <li key={lesson.id}>
                <Link
                  href={`/courses/${course.slug}/${lesson.slug}`}
                  onClick={onClose}
                  className={[
                    "block rounded-sm px-3 py-2 text-sm transition-colors",
                    isCurrent
                      ? "bg-bg-brand-softer font-medium text-text-fg-brand-strong"
                      : "text-text-body hover:bg-bg-secondary-soft hover:text-text-heading",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center text-xs font-bold">
                      {isCompleted ? (
                        <Check className="size-4 text-text-fg-brand-strong" aria-hidden />
                      ) : (
                        <span className="text-text-muted">{index + 1}</span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="leading-tight">{lesson.title}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="size-3" aria-hidden />
                        {lesson.estimatedMinutes} min
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
