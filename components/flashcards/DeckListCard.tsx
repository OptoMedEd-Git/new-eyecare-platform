import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import type { DeckListing } from "@/lib/flashcards/types";

type Props = {
  deck: DeckListing;
};

export function DeckListCard({ deck }: Props) {
  return (
    <article className="group flex h-full flex-col rounded-base border border-border-default bg-bg-primary-soft p-6 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-lg font-bold text-text-heading group-hover:text-text-fg-brand-strong">{deck.title}</h2>
        {deck.isFeatured ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
            <Sparkles className="size-3.5" aria-hidden />
            Featured
          </span>
        ) : null}
      </div>

      {deck.description ? (
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-text-body">{deck.description}</p>
      ) : (
        <p className="mt-2 flex-1 text-sm text-text-muted">Curated flashcard set.</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted">
        {deck.category ? (
          <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 font-medium text-text-fg-brand-strong">
            {deck.category.name}
          </span>
        ) : null}
        <span className="font-medium capitalize">{deck.difficulty ?? "—"}</span>
        {deck.audience ? (
          <>
            <span aria-hidden>·</span>
            <span className="font-medium capitalize">{deck.audience === "all" ? "All clinicians" : deck.audience}</span>
          </>
        ) : null}
        <span aria-hidden>·</span>
        <span className="tabular-nums">{deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}</span>
      </div>

      <Link
        href={`/flashcards/decks/${deck.slug}`}
        className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors group-hover:underline"
      >
        View deck
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </article>
  );
}
