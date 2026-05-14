import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Home, Inbox } from "lucide-react";

import { DeckReviewOrchestrator } from "@/components/flashcards/DeckReviewOrchestrator";
import { getFlaggedFlashcardIds, getPublishedDeckBySlug } from "@/lib/flashcards/queries";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deck = await getPublishedDeckBySlug(slug);
  return { title: deck ? `Review · ${deck.title}` : "Deck review" };
}

export default async function DeckReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const deck = await getPublishedDeckBySlug(slug);
  if (!deck) notFound();

  const flaggedIds = await getFlaggedFlashcardIds();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 lg:py-10">
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
        <Link href="/flashcards/decks" className="text-text-muted transition-colors hover:text-text-heading">
          Decks
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link href={`/flashcards/decks/${slug}`} className="text-text-muted transition-colors hover:text-text-heading">
          {deck.title}
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">Review</span>
      </nav>

      <Link
        href={`/flashcards/decks/${slug}`}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
      >
        ← Back to deck
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-bold text-text-heading lg:text-3xl">{deck.title}</h1>
        <p className="mt-2 text-sm text-text-body">Cards appear in deck order. Use Next to move forward.</p>
      </header>

      <div className="mt-6">
        {deck.cards.length === 0 ? (
          <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
            <Inbox className="mx-auto size-8 text-text-muted" aria-hidden />
            <p className="mt-3 text-base font-medium text-text-heading">This deck has no cards yet</p>
            <p className="mt-1 text-sm text-text-body">Check back later — content is still being added.</p>
            <Link
              href={`/flashcards/decks/${slug}`}
              className="mt-6 inline-flex text-sm font-medium text-text-fg-brand-strong hover:underline"
            >
              Back to deck overview
            </Link>
          </div>
        ) : (
          <DeckReviewOrchestrator deck={deck} initialFlaggedFlashcardIds={flaggedIds} />
        )}
      </div>
    </div>
  );
}
