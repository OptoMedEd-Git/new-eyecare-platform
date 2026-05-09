import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

import { LessonsAdminTable } from "@/components/admin/courses/LessonsAdminTable";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getCourseForEdit, getLessonsForCourseAdmin } from "@/lib/courses/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourseForEdit(id);
  return { title: course ? `Lessons: ${course.title}` : "Lessons" };
}

export default async function CourseLessonsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const course = await getCourseForEdit(id);
  if (!course) {
    notFound();
  }

  const lessons = await getLessonsForCourseAdmin(id);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumb
        showHomeIcon={false}
        items={[
          { label: "Admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title, href: `/admin/courses/${id}/edit` },
          { label: "Lessons" },
        ]}
      />
      <Link
        href={`/admin/courses/${id}/edit`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to course
      </Link>

      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-heading">Lessons</h1>
            <p className="mt-1 text-sm text-text-body">{course.title}</p>
          </div>
          <Link
            href={`/admin/courses/${id}/lessons/new`}
            className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus:outline-none focus:ring-4 focus:ring-ring-brand"
          >
            <Plus className="size-4" aria-hidden />
            New lesson
          </Link>
        </div>

        {lessons.length === 0 ? (
          <div className="rounded-base border border-dashed border-border-default bg-bg-primary-soft px-6 py-12 text-center text-sm text-text-body">
            No lessons yet. Add a lesson to build your course outline.
          </div>
        ) : (
          <LessonsAdminTable courseId={id} lessons={lessons} />
        )}
      </div>
    </div>
  );
}
