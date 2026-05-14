"use client";

import { deleteDeck } from "@/app/(admin)/admin/flashcards/decks/actions";
import { PostStatusPill } from "@/components/admin/PostStatusPill";
import type { AdminDeckRow } from "@/lib/flashcards/admin-queries";
import { formatRelativeTime } from "@/lib/blog/utils";
import { Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function FlashcardDecksAdminTable({ decks }: { decks: AdminDeckRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete deck “${title}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteDeck(id);
      if (!result.success) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto rounded-base border border-border-default bg-bg-primary-soft shadow-xs">
      <table className="w-full min-w-[44rem] table-fixed">
        <thead className="bg-bg-secondary-soft">
          <tr className="border-b border-border-default">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Deck
            </th>
            <th
              scope="col"
              className="w-24 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Status
            </th>
            <th
              scope="col"
              className="hidden w-32 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted md:table-cell"
            >
              Slug
            </th>
            <th
              scope="col"
              className="w-20 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Cards
            </th>
            <th
              scope="col"
              className="hidden w-20 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-text-muted lg:table-cell"
            >
              Featured
            </th>
            <th
              scope="col"
              className="w-32 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Updated
            </th>
            <th
              scope="col"
              className="w-24 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {decks.map((deck, idx) => {
            const isLast = idx === decks.length - 1;
            const rowClassName = "align-top" + (isLast ? "" : " border-b border-border-default");

            return (
              <tr key={deck.id} className={rowClassName}>
                <td className="min-w-0 px-6 py-3">
                  <Link
                    href={`/admin/flashcards/decks/${deck.id}/edit`}
                    className="break-words font-semibold text-text-heading hover:text-text-fg-brand-strong"
                  >
                    {deck.title}
                  </Link>
                  {deck.category ? (
                    <p className="mt-1 text-xs text-text-muted">{deck.category.name}</p>
                  ) : null}
                </td>
                <td className="px-6 py-3">
                  <PostStatusPill status={deck.status === "published" ? "published" : "draft"} />
                </td>
                <td className="hidden w-32 px-6 py-3 md:table-cell">
                  <span className="block truncate font-mono text-xs text-text-muted" title={deck.slug}>
                    {deck.slug}
                  </span>
                </td>
                <td className="px-6 py-3 text-right tabular-nums text-sm text-text-body">{deck.card_count}</td>
                <td className="hidden px-6 py-3 text-center text-sm text-text-body lg:table-cell">
                  {deck.is_featured ? (
                    <Star
                      className="inline size-4 text-text-fg-warning-strong"
                      fill="currentColor"
                      aria-label="Featured"
                    />
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-xs text-text-muted">
                  {formatRelativeTime(deck.updated_at)}
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/flashcards/decks/${deck.id}/edit`}
                      className="inline-flex size-9 items-center justify-center rounded-sm text-text-muted hover:bg-bg-secondary-soft hover:text-text-heading"
                      aria-label={`Edit ${deck.title}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(deck.id, deck.title)}
                      disabled={pending}
                      className="inline-flex size-9 items-center justify-center rounded-sm text-text-muted hover:bg-bg-danger-softer hover:text-text-fg-danger-strong disabled:opacity-40"
                      aria-label={`Delete ${deck.title}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
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
