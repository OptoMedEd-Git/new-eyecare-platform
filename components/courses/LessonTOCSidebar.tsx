import Link from "next/link";
import { Check, Clock } from "lucide-react";

import type { SampleCourse } from "@/lib/courses/sample-data";

type Props = {
  course: SampleCourse;
  currentLessonSlug: string;
};

export function LessonTOCSidebar({ course, currentLessonSlug }: Props) {
  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-24 rounded-base border border-border-default bg-bg-primary-soft p-4">
        <Link href={`/courses/${course.slug}`} className="text-xs font-medium text-text-fg-brand-strong hover:underline">
          ← {course.title}
        </Link>

        <h3 className="mt-2 text-sm font-bold text-text-heading">Lessons</h3>

        <ol className="mt-3 flex flex-col gap-1">
          {course.lessons.map((lesson, index) => {
            const isCurrent = lesson.slug === currentLessonSlug;
            const isCompleted = lesson.status === "completed";

            return (
              <li key={lesson.id}>
                <Link
                  href={`/courses/${course.slug}/${lesson.slug}`}
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
    </aside>
  );
}
