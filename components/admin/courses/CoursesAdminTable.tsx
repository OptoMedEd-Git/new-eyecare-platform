"use client";

import Link from "next/link";

import { PostStatusPill } from "@/components/admin/PostStatusPill";
import type { AdminCourseListItem } from "@/lib/courses/admin-queries";
import { formatRelativeTime } from "@/lib/blog/utils";

export function CoursesAdminTable({ courses }: { courses: AdminCourseListItem[] }) {
  return (
    <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft shadow-xs">
      <table className="w-full table-fixed">
        <thead className="bg-bg-secondary-soft">
          <tr className="border-b border-border-default">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Title
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Lessons
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Updated
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, idx) => {
            const isLast = idx === courses.length - 1;
            const rowClassName =
              "transition-colors hover:bg-bg-secondary-soft" + (isLast ? "" : " border-b border-border-default");

            return (
              <tr key={course.id} className={rowClassName}>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="block truncate text-sm font-medium text-text-heading hover:underline"
                    title={course.title}
                  >
                    {course.title}
                  </Link>
                  {course.description ? (
                    <p className="mt-1 truncate text-sm text-text-body">{course.description}</p>
                  ) : null}
                </td>
                <td className="px-6 py-4">
                  <PostStatusPill status={course.status} />
                </td>
                <td className="px-6 py-4 text-sm text-text-body">{course.category?.name ?? "—"}</td>
                <td className="px-6 py-4 text-sm text-text-body">{course.lesson_count}</td>
                <td className="px-6 py-4 text-sm text-text-body">{formatRelativeTime(course.updated_at)}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link href={`/admin/courses/${course.id}/edit`} className="font-medium text-text-fg-brand hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
