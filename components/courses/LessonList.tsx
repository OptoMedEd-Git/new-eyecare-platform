import Link from "next/link";
import { ArrowRight, Check, Clock } from "lucide-react";

import type { Course, Lesson } from "@/lib/courses/types";

type Props = {
  course: Course;
  completedLessonIds: string[];
};

export function LessonList({ course, completedLessonIds }: Props) {
  const completedSet = new Set(completedLessonIds);

  return (
    <ol className="flex flex-col">
      {course.lessons.map((lesson, index) => (
        <LessonRow
          key={lesson.id}
          lesson={lesson}
          isCompleted={completedSet.has(lesson.id)}
          index={index}
          courseSlug={course.slug}
          isLast={index === course.lessons.length - 1}
        />
      ))}
    </ol>
  );
}

function LessonRow({
  lesson,
  isCompleted,
  index,
  courseSlug,
  isLast,
}: {
  lesson: Lesson;
  isCompleted: boolean;
  index: number;
  courseSlug: string;
  isLast: boolean;
}) {
  return (
    <li className={`flex items-center gap-4 py-4 ${!isLast ? "border-b border-border-default" : ""}`}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full">
        {isCompleted ? (
          <span className="flex size-8 items-center justify-center rounded-full bg-bg-brand text-text-on-brand">
            <Check className="size-4" aria-hidden />
          </span>
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-border-default text-xs font-bold text-text-muted">
            {index + 1}
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold leading-tight text-text-heading">
          <Link
            href={`/courses/${courseSlug}/${lesson.slug}`}
            className="transition-colors hover:text-text-fg-brand-strong"
          >
            {lesson.title}
          </Link>
        </h3>
        {lesson.description ? (
          <p className="mt-1 text-sm leading-relaxed text-text-body">{lesson.description}</p>
        ) : null}
        <div className="mt-1.5 flex items-center gap-3 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {lesson.estimatedMinutes} min
          </span>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-text-fg-brand-strong">
              <Check className="size-3.5" aria-hidden />
              Completed
            </span>
          ) : null}
        </div>
      </div>

      <Link
        href={`/courses/${courseSlug}/${lesson.slug}`}
        aria-label={`Open ${lesson.title}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading"
      >
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </li>
  );
}
