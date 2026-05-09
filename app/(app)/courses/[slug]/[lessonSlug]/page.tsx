import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { LessonPageLayout } from "@/components/courses/LessonPageLayout";
import { renderContent } from "@/lib/blog/render-content";
import { getCourseBySlug, getLessonBySlug, getLessonNeighbors } from "@/lib/courses/sample-data";
import { getCompletedLessonIdsForCourse } from "@/lib/courses/queries";
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

  const course = getCourseBySlug(slug);
  if (!course) {
    notFound();
  }

  const lesson = getLessonBySlug(slug, lessonSlug);
  if (!lesson) {
    notFound();
  }

  const { previous, next } = getLessonNeighbors(slug, lessonSlug);
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

      <div className="mt-6">
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
    </div>
  );
}
