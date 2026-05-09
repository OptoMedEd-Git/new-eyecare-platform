"use client";

import { useState } from "react";

import type { SampleCourse, SampleLesson } from "@/lib/courses/sample-data";

import { LessonNavigatorDrawer } from "./LessonNavigatorDrawer";
import { LessonPrevNext } from "./LessonPrevNext";
import { LessonTOCSidebar } from "./LessonTOCSidebar";
import { MarkCompleteCheckpoint } from "./MarkCompleteCheckpoint";

/** Same prose stack as `app/blog/[slug]/page.tsx` for `renderContent` HTML. */
const LESSON_CONTENT_PROSE_CLASS =
  "blog-content mt-8 prose prose-lg max-w-none text-text-body prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-900 prose-p:leading-relaxed prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-brand prose-blockquote:text-text-body prose-strong:text-gray-900 prose-code:rounded-md prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-gray-800 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-md dark:prose-invert dark:prose-headings:text-white dark:prose-blockquote:text-gray-300 dark:prose-code:bg-gray-800 dark:prose-code:text-gray-100";

type Props = {
  course: SampleCourse;
  lesson: SampleLesson;
  previous: SampleLesson | null;
  next: SampleLesson | null;
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
          <LessonPrevNext
            courseSlug={course.slug}
            previous={previous}
            next={next}
            onOpenDrawer={() => setDrawerOpen(true)}
          />

          <header className="mt-6">
            <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">{lesson.title}</h1>
            {lesson.description ? (
              <p className="mt-3 text-base leading-relaxed text-text-body">{lesson.description}</p>
            ) : null}
          </header>

          <div className={LESSON_CONTENT_PROSE_CLASS} dangerouslySetInnerHTML={{ __html: renderedHtml }} />

          <div className="max-w-3xl">
            <MarkCompleteCheckpoint
              key={`${lesson.id}-${isCurrentLessonCompleted}`}
              lesson={lesson}
              courseId={course.id}
              courseSlug={course.slug}
              isCompleted={isCurrentLessonCompleted}
              nextLesson={next}
            />
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
