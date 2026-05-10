"use client";

import { Target } from "lucide-react";
import { useState } from "react";

import type { Course, Lesson } from "@/lib/courses/types";

import { LessonNavigatorDrawer } from "./LessonNavigatorDrawer";
import { LessonPrevNext } from "./LessonPrevNext";
import { LessonTOCSidebar } from "./LessonTOCSidebar";
import { MarkCompleteCheckpoint } from "./MarkCompleteCheckpoint";

/** Same prose stack as `app/blog/[slug]/page.tsx` for `renderContent` HTML. */
const LESSON_CONTENT_PROSE_CLASS =
  "blog-content mt-8 prose prose-lg max-w-none text-text-body prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-900 prose-p:leading-relaxed prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-brand prose-blockquote:text-text-body prose-strong:text-gray-900 prose-code:rounded-md prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-gray-800 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-md dark:prose-invert dark:prose-headings:text-white dark:prose-blockquote:text-gray-300 dark:prose-code:bg-gray-800 dark:prose-code:text-gray-100";

type Props = {
  course: Course;
  lesson: Lesson;
  previous: Lesson | null;
  next: Lesson | null;
  renderedHtml: string;
  completedLessonIds: string[];
  isCurrentLessonCompleted: boolean;
};

export function LessonPageLayout({
  course,
  lesson,
  previous,
  next,
  renderedHtml,
  completedLessonIds,
  isCurrentLessonCompleted,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="flex gap-8">
        <article className="min-w-0 flex-1">
          <div className="mt-6 max-w-3xl">
            {lesson.learningObjectives.length > 0 ? (
              <section className="rounded-base border border-border-default bg-bg-secondary-soft p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-text-heading">
                  <Target className="size-4 text-text-fg-brand-strong" aria-hidden />
                  In this lesson, you&apos;ll learn to:
                </h2>
                <ul className="mt-3 space-y-1.5">
                  {lesson.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-text-body">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-text-muted" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div
              className={
                lesson.learningObjectives.length > 0
                  ? LESSON_CONTENT_PROSE_CLASS.replace(/\bmt-8\b/, "mt-6")
                  : LESSON_CONTENT_PROSE_CLASS
              }
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />

            <div>
              <MarkCompleteCheckpoint
                key={`${lesson.id}-${isCurrentLessonCompleted}`}
                lesson={lesson}
                courseId={course.id}
                courseSlug={course.slug}
                isCompleted={isCurrentLessonCompleted}
              />
            </div>

            <div className="mt-8">
              <LessonPrevNext
                courseSlug={course.slug}
                previous={previous}
                next={next}
                onOpenDrawer={() => setDrawerOpen(true)}
              />
            </div>
          </div>
        </article>

        <LessonTOCSidebar
          course={course}
          currentLessonSlug={lesson.slug}
          completedLessonIds={completedLessonIds}
        />
      </div>

      <LessonNavigatorDrawer
        course={course}
        currentLessonSlug={lesson.slug}
        completedLessonIds={completedLessonIds}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
