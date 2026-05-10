"use client";

import { deleteQuiz } from "@/app/(admin)/admin/quiz-bank/quizzes/actions";
import { PostStatusPill } from "@/components/admin/PostStatusPill";
import type { AdminQuizRow } from "@/lib/quiz-bank/admin-queries";
import { formatRelativeTime } from "@/lib/blog/utils";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function QuizzesAdminTable({ quizzes }: { quizzes: AdminQuizRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete quiz “${title}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteQuiz(id);
      if (!result.success) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft shadow-xs">
      <table className="w-full table-fixed">
        <thead className="bg-bg-secondary-soft">
          <tr className="border-b border-border-default">
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Quiz
            </th>
            <th
              scope="col"
              className="w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Status
            </th>
            <th
              scope="col"
              className="hidden w-36 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted md:table-cell"
            >
              Slug
            </th>
            <th
              scope="col"
              className="w-24 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Questions
            </th>
            <th
              scope="col"
              className="hidden w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted lg:table-cell"
            >
              Featured
            </th>
            <th
              scope="col"
              className="w-36 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Updated
            </th>
            <th
              scope="col"
              className="w-40 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz, idx) => {
            const isLast = idx === quizzes.length - 1;
            const rowClassName =
              "transition-colors hover:bg-bg-secondary-soft" + (isLast ? "" : " border-b border-border-default");

            return (
              <tr key={quiz.id} className={rowClassName}>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/quiz-bank/quizzes/${quiz.id}/edit`}
                    className="block truncate text-sm font-medium text-text-heading hover:underline"
                    title={quiz.title}
                  >
                    {quiz.title}
                  </Link>
                  {quiz.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-text-body">{quiz.description}</p>
                  ) : null}
                </td>
                <td className="px-6 py-4 align-top">
                  <PostStatusPill status={quiz.status === "published" ? "published" : "draft"} />
                </td>
                <td className="hidden px-6 py-4 align-top text-sm text-text-muted md:table-cell">
                  <span className="break-all">{quiz.slug ?? "—"}</span>
                </td>
                <td className="px-6 py-4 align-top text-sm text-text-body">{quiz.question_count}</td>
                <td className="hidden px-6 py-4 align-top lg:table-cell">
                  {quiz.is_featured ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-text-fg-brand-strong">
                      <Sparkles className="size-3.5" aria-hidden />
                      Yes
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted">—</span>
                  )}
                </td>
                <td className="px-6 py-4 align-top text-sm text-text-body">{formatRelativeTime(quiz.updated_at)}</td>
                <td className="px-6 py-4 text-right align-top text-sm">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/quiz-bank/quizzes/${quiz.id}/edit`}
                      className="inline-flex items-center gap-1 font-medium text-text-fg-brand hover:underline"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDelete(quiz.id, quiz.title)}
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
  );
}
