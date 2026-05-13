"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { deleteFlashcard } from "@/app/(admin)/admin/flashcards/actions";
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

  return (
    <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft shadow-xs">
      <table className="w-full table-fixed">
        <thead className="bg-bg-secondary-soft">
          <tr className="border-b border-border-default">
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Front
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
          {flashcards.map((row, idx) => {
            const isLast = idx === flashcards.length - 1;
            const rowClassName =
              "transition-colors hover:bg-bg-secondary-soft" + (isLast ? "" : " border-b border-border-default");

            return (
              <tr key={row.id} className={rowClassName}>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/flashcards/${row.id}/edit`}
                    className="block text-sm font-medium text-text-heading hover:underline"
                    title={row.front}
                  >
                    {excerpt(row.front)}
                  </Link>
                </td>
                <td className="px-6 py-4 align-top">
                  <PostStatusPill status={row.status === "published" ? "published" : "draft"} />
                </td>
                <td className="px-6 py-4 align-top text-sm text-text-body">
                  {row.category && !Array.isArray(row.category) ? row.category.name : "—"}
                </td>
                <td className="px-6 py-4 align-top text-sm capitalize text-text-body">{row.target_audience ?? "—"}</td>
                <td className="px-6 py-4 align-top text-sm capitalize text-text-body">{row.difficulty}</td>
                <td className="px-6 py-4 align-top text-sm text-text-body">{formatRelativeTime(row.updated_at)}</td>
                <td className="px-6 py-4 text-right align-top text-sm">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
