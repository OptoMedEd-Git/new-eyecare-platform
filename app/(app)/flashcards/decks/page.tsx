import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { DeckListCard } from "@/components/flashcards/DeckListCard";
import { getPublishedDecks } from "@/lib/flashcards/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Flashcards — Decks" };

export default async function FlashcardDecksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const decks = await getPublishedDecks();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-text-muted transition-colors hover:text-text-heading"
        >
          <Home className="size-4" aria-hidden />
          Home
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link href="/flashcards" className="text-text-muted transition-colors hover:text-text-heading">
          Flashcards
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">Decks</span>
      </nav>

      <Link
        href="/flashcards"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
      >
        ← Back to flashcards
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">Curated decks</h1>
        <p className="mt-2 max-w-2xl text-base text-text-body">
          Focused collections of flashcards on specific topics. Open a deck to preview cards, then start a structured
          review in order.
        </p>
      </header>

      {decks.length === 0 ? (
        <div className="mt-10 rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
          <p className="text-base font-medium text-text-heading">No published decks yet</p>
          <p className="mt-1 text-sm text-text-body">Check back soon — we&apos;re curating new sets.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((d) => (
            <DeckListCard key={d.id} deck={d} />
          ))}
        </div>
      )}
    </div>
  );
}
