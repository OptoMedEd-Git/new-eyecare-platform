import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LessonForm } from "@/components/admin/courses/LessonForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getCourseForEdit } from "@/lib/courses/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourseForEdit(id);
  return { title: course ? `New lesson — ${course.title}` : "New lesson" };
}

export default async function NewLessonPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumb
        showHomeIcon={false}
        items={[
          { label: "Admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title, href: `/admin/courses/${id}/edit` },
          { label: "Lessons", href: `/admin/courses/${id}/lessons` },
          { label: "New lesson" },
        ]}
      />
      <Link
        href={`/admin/courses/${id}/lessons`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to lessons
      </Link>

      <div className="mt-8">
        <LessonForm courseId={id} courseTitle={course.title} />
      </div>
    </div>
  );
}
