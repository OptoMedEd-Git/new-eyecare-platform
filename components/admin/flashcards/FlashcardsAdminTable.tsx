"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { deleteFlashcard } from "@/app/(admin)/admin/flashcards/actions";
import { AdminTable, type AdminTableColumn } from "@/components/admin/shared/AdminTable";
import { PostStatusPill } from "@/components/admin/PostStatusPill";
import { formatRelativeTime } from "@/lib/blog/utils";
import type { AdminFlashcardRow } from "@/lib/flashcards/admin-queries";

function excerpt(text: string, max = 80): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function FlashcardsAdminTable({ flashcards }: { flashcards: AdminFlashcardRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string, previewSource: string) {
    const preview = excerpt(previewSource, 60);
    if (!window.confirm(`Delete this flashcard?\n\n${preview}\n\nThis cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteFlashcard(id);
      if (!result.success) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  const columns: AdminTableColumn<AdminFlashcardRow>[] = [
    {
      id: "front",
      header: "Front",
      cell: ({ row }) => (
        <Link
          href={`/admin/flashcards/${row.id}/edit`}
          className="block text-sm font-medium text-text-heading hover:underline"
          title={row.front}
        >
          {excerpt(row.front)}
        </Link>
      ),
    },
    {
      id: "status",
      header: "Status",
      widthClass: "w-28",
      tdClassName: "align-top",
      cell: ({ row }) => <PostStatusPill status={row.status === "published" ? "published" : "draft"} />,
    },
    {
      id: "category",
      header: "Category",
      widthClass: "w-36",
      tdClassName: "align-top text-sm text-text-body",
      cell: ({ row }) => (row.category && !Array.isArray(row.category) ? row.category.name : "—"),
    },
    {
      id: "audience",
      header: "Audience",
      widthClass: "w-28",
      tdClassName: "align-top text-sm capitalize text-text-body",
      cell: ({ row }) => row.target_audience ?? "—",
    },
    {
      id: "difficulty",
      header: "Difficulty",
      widthClass: "w-32",
      tdClassName: "align-top text-sm capitalize text-text-body",
      cell: ({ row }) => row.difficulty,
    },
    {
      id: "updated",
      header: "Updated",
      widthClass: "w-36",
      tdClassName: "align-top text-sm text-text-body",
      cell: ({ row }) => formatRelativeTime(row.updated_at),
    },
    {
      id: "actions",
      header: "Actions",
      widthClass: "w-40",
      align: "right",
      tdClassName: "text-right align-top text-sm",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/admin/flashcards/${row.id}/edit`}
            className="inline-flex items-center gap-1 font-medium text-text-fg-brand hover:underline"
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={() => handleDelete(row.id, row.front)}
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
      rows={flashcards}
      getRowKey={(row) => row.id}
      columns={columns}
    />
  );
}
