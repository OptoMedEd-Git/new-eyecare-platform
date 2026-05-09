import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CourseForm } from "@/components/admin/courses/CourseForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getBlogCategoriesForCourseForms, getCourseForEdit } from "@/lib/courses/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourseForEdit(id);
  return { title: course ? `Edit: ${course.title}` : "Edit course" };
}

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const [course, categories] = await Promise.all([getCourseForEdit(id), getBlogCategoriesForCourseForms()]);

  if (!course) {
    notFound();
  }

  const authorName =
    [course.author?.first_name, course.author?.last_name].filter((x): x is string => Boolean(x?.trim())).join(" ").trim() ||
    "—";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumb
        showHomeIcon={false}
        items={[
          { label: "Admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title, href: `/admin/courses/${id}/edit` },
        ]}
      />
      <Link
        href="/admin/courses"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to courses
      </Link>

      <div className="mt-8">
        <CourseForm categories={categories} authorName={authorName} initialCourse={course} />
      </div>
    </div>
  );
}
