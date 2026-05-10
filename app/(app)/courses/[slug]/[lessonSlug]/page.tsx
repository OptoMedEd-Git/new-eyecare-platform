import Link from "next/link";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { LessonPageLayout } from "@/components/courses/LessonPageLayout";
import { renderContent } from "@/lib/blog/render-content";
import {
  getCompletedLessonIdsForCourse,
  getLessonNeighborsFromCourse,
  getPublishedLessonByCourseAndSlug,
} from "@/lib/courses/queries";
import { createClient } from "@/lib/supabase/server";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const result = await getPublishedLessonByCourseAndSlug(slug, lessonSlug);
  if (!result) {
    notFound();
  }

  const { course, lesson } = result;
  const { previous, next } = getLessonNeighborsFromCourse(course, lessonSlug);
  const renderedHtml = renderContent(lesson.content);

  const completedLessonIds = await getCompletedLessonIdsForCourse(course.id);
  const isCompleted = completedLessonIds.includes(lesson.id);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-text-muted transition-colors hover:text-text-heading"
        >
          <Home className="size-4" aria-hidden />
          Home
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link href="/courses" className="text-text-muted transition-colors hover:text-text-heading">
          Courses
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link href={`/courses/${course.slug}`} className="text-text-muted transition-colors hover:text-text-heading">
          {course.title}
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">{lesson.title}</span>
      </nav>

      <Link
        href={`/courses/${course.slug}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {course.title}
      </Link>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">{lesson.title}</h1>

      {lesson.description ? (
        <p className="mt-3 text-base leading-relaxed text-text-body">{lesson.description}</p>
      ) : null}

      <LessonPageLayout
        course={course}
        lesson={lesson}
        previous={previous}
        next={next}
        renderedHtml={renderedHtml}
        completedLessonIds={completedLessonIds}
        isCurrentLessonCompleted={isCompleted}
      />
    </div>
  );
}
