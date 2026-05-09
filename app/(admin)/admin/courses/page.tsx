import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, Plus } from "lucide-react";

import { CoursesAdminTable } from "@/components/admin/courses/CoursesAdminTable";
import { getAdminCourses } from "@/lib/courses/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export const metadata = { title: "Courses (admin)" };

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();

  if (!profile || profile.role === "member") {
    redirect("/dashboard");
  }

  const role = profile.role;
  const courses = await getAdminCourses(user.id, role);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Courses</h1>
          <p className="mt-1 text-sm text-text-body">
            Create multi-lesson courses, manage lessons, and publish when ready.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus:outline-none focus:ring-4 focus:ring-ring-brand"
        >
          <Plus className="size-4" aria-hidden />
          New course
        </Link>
      </div>

      {courses.length === 0 ? <EmptyState /> : <CoursesAdminTable courses={courses} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-base border border-dashed border-border-default bg-bg-primary-soft px-6 py-16 text-center">
      <GraduationCap className="size-8 text-text-muted" aria-hidden />
      <h3 className="mt-4 text-lg font-semibold text-text-heading">No courses yet</h3>
      <p className="mt-1 max-w-sm text-sm text-text-body">
        Published courses are visible to learners once you add lessons and publish. Start by creating a course.
      </p>
      <p className="mt-4 text-xs text-text-muted">
        Draft courses you own appear here. Visibility follows your account permissions.
      </p>
    </div>
  );
}
