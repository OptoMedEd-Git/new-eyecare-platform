"use client";

import { deleteLesson, moveLesson } from "@/app/(admin)/admin/courses/actions";
import type { AdminLessonRow } from "@/lib/courses/admin-queries";
import { formatRelativeTime } from "@/lib/blog/utils";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

type LessonsAdminTableProps = {
  courseId: string;
  lessons: AdminLessonRow[];
};

type OptimisticAction = { lessonId: string; direction: "up" | "down" };

function swapOrderIndices(rows: AdminLessonRow[], lessonId: string, direction: "up" | "down"): AdminLessonRow[] {
  const sorted = [...rows].sort((a, b) => a.order_index - b.order_index);
  const idx = sorted.findIndex((l) => l.id === lessonId);
  if (idx === -1) return rows;

  const neighborIdx = direction === "up" ? idx - 1 : idx + 1;
  if (neighborIdx < 0 || neighborIdx >= sorted.length) return rows;

  const a = sorted[idx]!;
  const b = sorted[neighborIdx]!;

  return rows.map((row) => {
    if (row.id === a.id) return { ...row, order_index: b.order_index };
    if (row.id === b.id) return { ...row, order_index: a.order_index };
    return row;
  });
}

export function LessonsAdminTable({ courseId, lessons: initialLessons }: LessonsAdminTableProps) {
  const router = useRouter();
  const [optimisticLessons, addOptimisticLessonMove] = useOptimistic(
    initialLessons,
    (state, action: OptimisticAction) => swapOrderIndices(state, action.lessonId, action.direction),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleMove(lessonId: string, direction: "up" | "down") {
    const sorted = [...optimisticLessons].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex((l) => l.id === lessonId);
    if (idx === -1) return;
    const neighborIdx = direction === "up" ? idx - 1 : idx + 1;
    if (neighborIdx < 0 || neighborIdx >= sorted.length) return;

    setError(null);

    startTransition(async () => {
      addOptimisticLessonMove({ lessonId, direction });
      const result = await moveLesson(courseId, lessonId, direction);
      if (!result.ok) {
        setError(result.error);
        router.refresh();
        return;
      }
      router.refresh();
    });
  }

  async function handleDelete(lessonId: string, title: string) {
    if (!window.confirm(`Delete lesson “${title}”? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteLesson(courseId, lessonId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const sorted = [...optimisticLessons].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p className="rounded-base border border-border-danger-subtle bg-bg-danger-soft px-3 py-2 text-sm text-text-fg-danger-strong">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft shadow-xs">
        <table className="w-full table-fixed">
          <thead className="bg-bg-secondary-soft">
            <tr className="border-b border-border-default">
              <th scope="col" className="w-28 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                Title
              </th>
              <th scope="col" className="w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                Minutes
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
            {sorted.map((lesson, idx) => {
              const isLast = idx === sorted.length - 1;
              const rowClassName =
                "transition-colors hover:bg-bg-secondary-soft" + (isLast ? "" : " border-b border-border-default");

              return (
                <tr key={lesson.id} className={rowClassName}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={pending || idx === 0}
                        onClick={() => handleMove(lesson.id, "up")}
                        className="rounded-base p-1.5 text-text-body hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Move lesson up"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={pending || idx === sorted.length - 1}
                        onClick={() => handleMove(lesson.id, "down")}
                        className="rounded-base p-1.5 text-text-body hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Move lesson down"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}
                      className="block truncate text-sm font-medium text-text-heading hover:underline"
                    >
                      {lesson.title}
                    </Link>
                    {lesson.description ? (
                      <p className="mt-1 truncate text-sm text-text-body">{lesson.description}</p>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-body">{lesson.estimated_minutes}</td>
                  <td className="px-6 py-4 text-sm text-text-body">{formatRelativeTime(lesson.updated_at)}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}
                        className="inline-flex items-center gap-1 font-medium text-text-fg-brand hover:underline"
                      >
                        <Pencil className="size-3.5" aria-hidden />
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleDelete(lesson.id, lesson.title)}
                        className="inline-flex items-center gap-1 font-medium text-text-fg-danger-strong hover:underline disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
