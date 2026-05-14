"use client";

import { deleteDeck } from "@/app/(admin)/admin/flashcards/decks/actions";
import { PostStatusPill } from "@/components/admin/PostStatusPill";
import type { AdminDeckRow } from "@/lib/flashcards/admin-queries";
import { formatRelativeTime } from "@/lib/blog/utils";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
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
    <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft shadow-xs">
      <table className="w-full table-fixed">
        <thead className="bg-bg-secondary-soft">
          <tr className="border-b border-border-default">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Deck
            </th>
            <th scope="col" className="w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Status
            </th>
            <th scope="col" className="hidden w-36 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted md:table-cell">
              Slug
            </th>
            <th scope="col" className="w-24 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Cards
            </th>
            <th scope="col" className="hidden w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted lg:table-cell">
              Featured
            </th>
            <th scope="col" className="w-36 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Updated
            </th>
            <th scope="col" className="w-40 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {decks.map((deck, idx) => {
            const isLast = idx === decks.length - 1;
            const rowClassName =
              "px-6 py-4 align-top" + (isLast ? "" : " border-b border-border-default");

            return (
              <tr key={deck.id} className={rowClassName}>
                <td className="min-w-0">
                  <p className="font-medium text-text-heading">{deck.title}</p>
                  {deck.category ? (
                    <p className="mt-1 text-xs text-text-muted">{deck.category.name}</p>
                  ) : null}
                </td>
                <td>
                  <PostStatusPill status={deck.status === "published" ? "published" : "draft"} />
                </td>
                <td className="hidden font-mono text-xs text-text-muted md:table-cell">{deck.slug}</td>
                <td className="tabular-nums text-sm text-text-body">{deck.card_count}</td>
                <td className="hidden text-sm text-text-body lg:table-cell">
                  {deck.is_featured ? (
                    <span className="inline-flex items-center gap-1 text-text-fg-brand-strong">
                      <Sparkles className="size-4" aria-hidden />
                      Yes
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap text-sm text-text-muted">{formatRelativeTime(deck.updated_at)}</td>
                <td className="text-right">
                  <div className="flex justify-end gap-1">
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
