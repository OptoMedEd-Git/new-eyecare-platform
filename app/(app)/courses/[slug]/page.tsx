import Link from "next/link";
import { Check, ChevronRight, Home, Target } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { CourseHero } from "@/components/courses/CourseHero";
import { LessonList } from "@/components/courses/LessonList";
import { PathwayContextBanner } from "@/components/pathways/PathwayContextBanner";
import { computeCourseProgress } from "@/lib/courses/progress";
import { getCompletedLessonIdsForCourse, getPublishedCourseBySlug } from "@/lib/courses/queries";
import { getPathwayBannerContext, parsePathwayQueryParam } from "@/lib/pathways/pathway-context";
import { createClient } from "@/lib/supabase/server";

export default async function CourseOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const pathwaySlug = parsePathwayQueryParam(sp);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const course = await getPublishedCourseBySlug(slug);
  if (!course) {
    notFound();
  }

  const completedLessonIds = await getCompletedLessonIdsForCourse(course.id);
  const progress = computeCourseProgress(course, completedLessonIds);

  const pathwayBanner = await getPathwayBannerContext({
    pathwaySlug,
    contentType: "course",
    contentId: course.id,
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      {pathwayBanner ? <PathwayContextBanner {...pathwayBanner} /> : null}
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
        <span className="font-medium text-text-heading">{course.title}</span>
      </nav>

      <div className="mt-6">
        <CourseHero course={course} progress={progress} />
      </div>

      {course.learningObjectives.length > 0 ? (
        <section className="mt-8 rounded-base border border-border-default bg-bg-primary-soft p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-text-heading">
            <Target className="size-5 text-text-fg-brand-strong" aria-hidden />
            What you&apos;ll learn
          </h2>
          <ul className="mt-4 space-y-2">
            {course.learningObjectives.map((obj, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-text-body">
                <Check className="mt-0.5 size-4 shrink-0 text-text-fg-brand-strong" aria-hidden />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-heading">Lessons</h2>
        <div className="mt-4 rounded-base border border-border-default bg-bg-primary-soft px-5">
          <LessonList course={course} completedLessonIds={completedLessonIds} />
        </div>
      </section>
    </div>
  );
}
