import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { redirect } from "next/navigation";

import { CourseBrowser } from "@/components/courses/CourseBrowser";
import type { CourseProgressSummary } from "@/lib/courses/progress";
import { computeCourseProgress, toProgressSummary } from "@/lib/courses/progress";
import { getCompletedLessonIdsForAllCourses, getPublishedCourses } from "@/lib/courses/queries";
import { createClient } from "@/lib/supabase/server";

export default async function CoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [courses, completionMap] = await Promise.all([
    getPublishedCourses(),
    getCompletedLessonIdsForAllCourses(),
  ]);

  const progressByCourseId: Record<string, CourseProgressSummary> = {};
  for (const course of courses) {
    const completedIds = completionMap.get(course.id) ?? [];
    progressByCourseId[course.id] = toProgressSummary(computeCourseProgress(course, completedIds));
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-text-muted transition-colors hover:text-text-heading"
        >
          <Home className="size-4" aria-hidden />
          Home
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">Courses</span>
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">Courses</h1>
        <p className="mt-2 max-w-2xl text-base text-text-body">
          Multi-lesson learning units on focused clinical topics. Each course breaks a domain into ordered lessons
          designed for sequential study.
        </p>
      </header>

      <div className="mt-8">
        <CourseBrowser courses={courses} progressByCourseId={progressByCourseId} />
      </div>
    </div>
  );
}
