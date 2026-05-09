import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CourseForm } from "@/components/admin/courses/CourseForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getBlogCategoriesForCourseForms } from "@/lib/courses/admin-queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "New course" };

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export default async function NewCoursePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const categories = await getBlogCategoriesForCourseForms();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumb
        showHomeIcon={false}
        items={[{ label: "Admin" }, { label: "Courses", href: "/admin/courses" }, { label: "New course" }]}
      />
      <Link
        href="/admin/courses"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to courses
      </Link>

      <div className="mt-8">
        <CourseForm categories={categories} />
      </div>
    </div>
  );
}
