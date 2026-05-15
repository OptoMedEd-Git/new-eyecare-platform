"use client";

import { deleteQuestion } from "@/app/(admin)/admin/quiz-bank/actions";
import { AdminTable, type AdminTableColumn } from "@/components/admin/shared/AdminTable";
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

  /*
   * Fixed columns 2–8 sum to 928px (w-32…w-40). table-fixed + w-full left column 1 as remainder; narrow
   * admin main (sidebar open) collapsed it and overflow:visible painted into column 2. min-w-[1128px] on
   * the table + overflow-x-auto on the wrapper (via AdminTable layout) preserves the four-session fix.
   */
  const columns: AdminTableColumn<AdminQuestionRow>[] = [
    {
      id: "vignette",
      header: <span className="block truncate">Vignette</span>,
      thClassName: "overflow-hidden",
      tdClassName: "overflow-hidden",
      cell: ({ row: q }) => (
        <>
          <Link
            href={`/admin/quiz-bank/${q.id}/edit`}
            className="block truncate text-sm font-medium text-text-heading hover:underline"
            title={rowPreview(q)}
          >
            {vignetteExcerpt(rowPreview(q))}
          </Link>
          <p className="mt-1 line-clamp-2 text-xs text-text-muted">{q.questionText}</p>
        </>
      ),
    },
    {
      id: "type",
      header: "Type",
      widthClass: "w-32",
      tdClassName: "align-top text-sm text-text-body",
      cell: ({ row: q }) =>
        q.questionType === "true_false"
          ? "True / False"
          : q.questionType === "multi_select"
            ? "Multi-select"
            : "Multiple choice",
    },
    {
      id: "status",
      header: "Status",
      widthClass: "w-28",
      tdClassName: "align-top",
      cell: ({ row: q }) => <PostStatusPill status={q.status === "published" ? "published" : "draft"} />,
    },
    {
      id: "category",
      header: "Category",
      widthClass: "w-36",
      tdClassName: "align-top text-sm text-text-body",
      cell: ({ row: q }) => (q.category ? q.category.name : "—"),
    },
    {
      id: "audience",
      header: "Audience",
      widthClass: "w-28",
      tdClassName: "align-top text-sm capitalize text-text-body",
      cell: ({ row: q }) => q.audience ?? "—",
    },
    {
      id: "difficulty",
      header: "Difficulty",
      widthClass: "w-32",
      tdClassName: "align-top text-sm capitalize text-text-body",
      cell: ({ row: q }) => q.difficulty,
    },
    {
      id: "updated",
      header: "Updated",
      widthClass: "w-36",
      tdClassName: "align-top text-sm text-text-body",
      cell: ({ row: q }) => formatRelativeTime(q.updatedAt),
    },
    {
      id: "actions",
      header: "Actions",
      widthClass: "w-40",
      align: "right",
      tdClassName: "text-right align-top text-sm",
      cell: ({ row: q }) => (
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
      ),
    },
  ];

  return (
    <AdminTable
      rows={questions}
      getRowKey={(q) => q.id}
      columns={columns}
      layout={{
        wrapperOverflow: "x-auto",
        tableMinWidthClass: "min-w-[1128px]",
      }}
    />
  );
}
