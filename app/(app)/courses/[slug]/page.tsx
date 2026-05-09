import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { CourseHero } from "@/components/courses/CourseHero";
import { LessonList } from "@/components/courses/LessonList";
import { getCourseBySlug } from "@/lib/courses/sample-data";
import { createClient } from "@/lib/supabase/server";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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
        <span className="font-medium text-text-heading">{course.title}</span>
      </nav>

      <div className="mt-6">
        <CourseHero course={course} />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-heading">Lessons</h2>
        <div className="mt-4 rounded-base border border-border-default bg-bg-primary-soft px-5">
          <LessonList course={course} />
        </div>
      </section>
    </div>
  );
}
