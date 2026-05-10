import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, Layers, Play } from "lucide-react";

import { CATEGORY_ICON_BY_NAME } from "@/lib/courses/category-icons";
import type { CourseProgress } from "@/lib/courses/progress";
import type { Course } from "@/lib/courses/types";
import { ProgressBar } from "@/components/shared/ProgressBar";

const AUDIENCE_LABELS = {
  student: "Student",
  resident: "Resident",
  practicing: "Practicing",
  all: "All clinicians",
} as const;

type Props = {
  course: Course;
  progress: CourseProgress;
};

export function CourseHero({ course, progress }: Props) {
  const Icon = CATEGORY_ICON_BY_NAME[course.category?.name ?? ""] ?? BookOpen;
  const hours = Math.floor(course.totalDurationMinutes / 60);
  const remainingMinutes = course.totalDurationMinutes % 60;
  const durationLabel =
    hours > 0 ? (remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`) : `${remainingMinutes}m`;

  const ctaLabel = !progress.hasStarted
    ? "Start course"
    : progress.nextLesson
      ? "Continue course"
      : "Course complete";

  const ctaHref = progress.nextLesson
    ? `/courses/${course.slug}/${progress.nextLesson.slug}`
    : `/courses/${course.slug}`;

  const firstLesson = course.lessons[0];

  return (
    <section className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="flex flex-col gap-4 p-6 lg:col-span-2 lg:p-8">
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

          <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">{course.title}</h1>

          <p className="text-base leading-relaxed text-text-body">{course.description ?? ""}</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-body">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="size-4 text-text-muted" aria-hidden />
              {course.lessons.length} lessons
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-text-muted" aria-hidden />
              {durationLabel} total
            </span>
          </div>

          {progress.completedCount > 0 ? (
            <div className="mt-4 max-w-md">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm text-text-body">
                <span>
                  {progress.completedCount} of {progress.totalCount} lessons completed
                </span>
                <span className="font-medium text-text-heading">{progress.percentComplete}%</span>
              </div>
              <ProgressBar
                value={progress.completedCount}
                max={progress.totalCount}
                size="md"
                ariaLabel={`Course progress: ${progress.percentComplete}% complete`}
              />
              <div className="mt-2 text-sm text-text-muted">
                {progress.nextLesson ? (
                  <span>Up next: {progress.nextLesson.title}</span>
                ) : (
                  <span>All lessons complete</span>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-2">
            {firstLesson ? (
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
              >
                <Play className="size-4 fill-current" aria-hidden />
                {ctaLabel}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative hidden min-h-[280px] lg:block">
          {course.coverImageUrl ? (
            <Image
              src={course.coverImageUrl}
              alt={course.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-bg-brand-softer">
              <Icon className="size-24 text-text-fg-brand-strong/40" aria-hidden />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
