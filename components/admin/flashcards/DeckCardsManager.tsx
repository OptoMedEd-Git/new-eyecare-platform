"use client";

import { removeCardFromDeck, reorderDeckItem } from "@/app/(admin)/admin/flashcards/decks/actions";
import type { AdminDeckItemRow } from "@/lib/flashcards/admin-queries";
import { ArrowDown, ArrowUp, Eye, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FlashcardPicker } from "./FlashcardPicker";

type Props = {
  deckId: string;
  initialItems: AdminDeckItemRow[];
};

function categoryLabel(row: AdminDeckItemRow["flashcard"]): string | null {
  const c = row.category;
  if (!c) return null;
  return c.name;
}

export function DeckCardsManager({ deckId, initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleMove(flashcardId: string, direction: -1 | 1) {
    const snapshot = items;
    const idx = items.findIndex((i) => i.flashcard_id === flashcardId);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const next = [...items];
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    setItems(next);
    setError(null);

    startTransition(async () => {
      const result = await reorderDeckItem(deckId, flashcardId, direction);
      if (!result.success) {
        setItems(snapshot);
        setError(result.error);
      }
    });
  }

  async function handleRemove(flashcardId: string) {
    if (!window.confirm("Remove this card from the deck? The flashcard itself stays in the bank.")) return;

    const result = await removeCardFromDeck(deckId, flashcardId);
    if (!result.success) {
      window.alert(result.error);
      return;
    }
    setItems((prev) => prev.filter((i) => i.flashcard_id !== flashcardId));
  }

  return (
    <section className="mx-auto w-full max-w-5xl rounded-base border border-border-default bg-bg-primary-soft p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-heading">Cards in deck</h2>
          <p className="mt-1 text-sm text-text-body">
            {items.length} {items.length === 1 ? "card" : "cards"} — order matches learner review sequence.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand hover:bg-bg-brand-medium"
        >
          <Plus className="size-4" aria-hidden />
          Add cards
        </button>
      </header>

      {error ? <p className="mt-3 text-sm text-text-fg-danger-strong">{error}</p> : null}

      <div className="mt-4">
        {items.length === 0 ? (
          <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-6 py-12 text-center">
            <p className="text-base font-medium text-text-heading">No cards added yet</p>
            <p className="mt-1 text-sm text-text-body">Click &ldquo;Add cards&rdquo; to pull in published flashcards.</p>
          </div>
        ) : (
          <ol className="flex flex-col rounded-base border border-border-default">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              const rowBorder = isLast ? "" : " border-b border-border-default";
              const cat = categoryLabel(item.flashcard);

              return (
                <li key={item.id} className={`flex items-start gap-4 p-4${rowBorder}`}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-brand-softer text-xs font-bold text-text-fg-brand-strong">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-heading">{item.flashcard.front}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      {cat ? (
                        <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-text-fg-brand-strong">
                          {cat}
                        </span>
                      ) : null}
                      <span className="capitalize">{item.flashcard.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(item.flashcard_id, -1)}
                      disabled={index === 0 || isPending}
                      aria-label="Move up"
                      className="flex size-8 items-center justify-center rounded-sm text-text-muted hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(item.flashcard_id, 1)}
                      disabled={index === items.length - 1 || isPending}
                      aria-label="Move down"
                      className="flex size-8 items-center justify-center rounded-sm text-text-muted hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" aria-hidden />
                    </button>
                    <Link
                      href={`/admin/flashcards/${item.flashcard_id}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Edit flashcard"
                      className="flex size-8 items-center justify-center rounded-sm text-text-muted hover:bg-bg-secondary-soft hover:text-text-heading"
                    >
                      <Eye className="size-4" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleRemove(item.flashcard_id)}
                      aria-label="Remove from deck"
                      className="flex size-8 items-center justify-center rounded-sm text-text-muted hover:bg-bg-danger-softer hover:text-text-fg-danger-strong"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {pickerOpen ? (
        <FlashcardPicker
          deckId={deckId}
          excludeIds={items.map((i) => i.flashcard_id)}
          onClose={() => setPickerOpen(false)}
          onComplete={() => {
            setPickerOpen(false);
            router.refresh();
          }}
        />
      ) : null}
    </section>
  );
}
