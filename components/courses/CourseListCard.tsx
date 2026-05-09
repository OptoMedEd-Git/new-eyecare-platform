import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Layers } from "lucide-react";

import { CATEGORY_ICON_BY_NAME } from "@/lib/courses/category-icons";
import type { CourseProgressSummary } from "@/lib/courses/progress";
import type { Course } from "@/lib/courses/types";

const AUDIENCE_LABELS = {
  student: "Student",
  resident: "Resident",
  practicing: "Practicing",
  all: "All clinicians",
} as const;

type Props = {
  course: Course;
  progress: CourseProgressSummary;
};

export function CourseListCard({ course, progress }: Props) {
  const Icon = CATEGORY_ICON_BY_NAME[course.category?.name ?? ""] ?? BookOpen;
  const hours = Math.floor(course.totalDurationMinutes / 60);
  const remainingMinutes = course.totalDurationMinutes % 60;
  const durationLabel =
    hours > 0 ? (remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`) : `${remainingMinutes}m`;

  return (
    <article className="flex flex-col gap-4 rounded-base border border-border-default bg-bg-primary-soft p-5 transition-shadow hover:shadow-md sm:flex-row">
      <Link href={`/courses/${course.slug}`} className="block sm:shrink-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-base bg-bg-brand-softer sm:aspect-auto sm:size-32">
          {course.coverImageUrl ? (
            <Image
              src={course.coverImageUrl}
              alt={course.title}
              fill
              sizes="(max-width: 640px) 100vw, 128px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon className="size-10 text-text-fg-brand-strong/50" aria-hidden />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          {course.category ? (
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {course.category.name}
            </span>
          ) : null}
          {course.audience ? (
            <span className="text-xs font-medium text-text-muted">{AUDIENCE_LABELS[course.audience]}</span>
          ) : null}
        </div>

        <h3 className="mt-2 text-lg font-bold leading-tight tracking-tight text-text-heading">
          <Link href={`/courses/${course.slug}`} className="transition-colors hover:text-text-fg-brand-strong">
            {course.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-body">{course.description ?? ""}</p>

        <div className="flex-1" />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Layers className="size-3.5" aria-hidden />
              {course.lessons.length} lessons
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {durationLabel}
            </span>
          </div>

          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
          >
            View course
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {progress.hasStarted ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-text-fg-brand-strong">{progress.percentComplete}% complete</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-secondary-soft">
              <div
                className="h-full rounded-full bg-bg-brand"
                style={{ width: `${Math.min(100, Math.max(0, progress.percentComplete))}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
