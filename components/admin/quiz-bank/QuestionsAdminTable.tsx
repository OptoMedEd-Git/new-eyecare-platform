"use client";

import { deleteQuestion } from "@/app/(admin)/admin/quiz-bank/actions";
import { PostStatusPill } from "@/components/admin/PostStatusPill";
import type { AdminQuestionRow } from "@/lib/quiz-bank/admin-queries";
import { formatRelativeTime } from "@/lib/blog/utils";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

function vignetteExcerpt(text: string | null | undefined, max = 80): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Primary row preview: vignette when present, otherwise question stem. */
function rowPreview(q: AdminQuestionRow): string {
  const v = q.vignette?.trim();
  if (v) return v;
  return q.questionText;
}

export function QuestionsAdminTable({ questions }: { questions: AdminQuestionRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string, previewSource: string) {
    const preview = vignetteExcerpt(previewSource, 60);
    if (!window.confirm(`Delete this question?\n\n${preview}\n\nThis cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteQuestion(id);
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
              Vignette
            </th>
            <th
              scope="col"
              className="w-32 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Type
            </th>
            <th
              scope="col"
              className="w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Status
            </th>
            <th
              scope="col"
              className="w-36 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Category
            </th>
            <th
              scope="col"
              className="w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Audience
            </th>
            <th
              scope="col"
              className="w-32 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Difficulty
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
          {questions.map((q, idx) => {
            const isLast = idx === questions.length - 1;
            const rowClassName =
              "transition-colors hover:bg-bg-secondary-soft" + (isLast ? "" : " border-b border-border-default");

            return (
              <tr key={q.id} className={rowClassName}>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/quiz-bank/${q.id}/edit`}
                    className="block text-sm font-medium text-text-heading hover:underline"
                    title={rowPreview(q)}
                  >
                    {vignetteExcerpt(rowPreview(q))}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs text-text-muted">{q.questionText}</p>
                </td>
                <td className="px-6 py-4 align-top text-sm text-text-body">
                  {q.questionType === "true_false"
                    ? "True / False"
                    : q.questionType === "multi_select"
                      ? "Multi-select"
                      : "Multiple choice"}
                </td>
                <td className="px-6 py-4 align-top">
                  <PostStatusPill status={q.status === "published" ? "published" : "draft"} />
                </td>
                <td className="px-6 py-4 align-top text-sm text-text-body">
                  {q.category ? q.category.name : "—"}
                </td>
                <td className="px-6 py-4 align-top text-sm capitalize text-text-body">
                  {q.audience ?? "—"}
                </td>
                <td className="px-6 py-4 align-top text-sm capitalize text-text-body">{q.difficulty}</td>
                <td className="px-6 py-4 align-top text-sm text-text-body">{formatRelativeTime(q.updatedAt)}</td>
                <td className="px-6 py-4 text-right align-top text-sm">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/quiz-bank/${q.id}/edit`}
                      className="inline-flex items-center gap-1 font-medium text-text-fg-brand hover:underline"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDelete(q.id, rowPreview(q))}
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
