import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ChevronRight, Home } from "lucide-react";

import { getPublishedDeckBySlug } from "@/lib/flashcards/queries";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deck = await getPublishedDeckBySlug(slug);
  return { title: deck ? `${deck.title} · Deck` : "Deck" };
}

export default async function DeckOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const deck = await getPublishedDeckBySlug(slug);
  if (!deck) notFound();

  const preview = deck.cards.slice(0, 5);

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
        <span className="font-medium text-text-heading">{deck.title}</span>
      </nav>

      <Link
        href="/flashcards/decks"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
      >
        ← Back to decks
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">{deck.title}</h1>
        {deck.description ? <p className="mt-3 text-base text-text-body">{deck.description}</p> : null}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-text-muted">
          {deck.category ? (
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {deck.category.name}
            </span>
          ) : null}
          <span className="capitalize font-medium text-text-body">{deck.difficulty ?? "—"}</span>
          {deck.audience ? (
            <>
              <span aria-hidden>·</span>
              <span className="capitalize font-medium text-text-body">
                {deck.audience === "all" ? "All clinicians" : deck.audience}
              </span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <span className="tabular-nums text-text-body">
            {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
          </span>
          {deck.isFeatured ? (
            <>
              <span aria-hidden>·</span>
              <span className="font-medium text-text-fg-brand-strong">Featured</span>
            </>
          ) : null}
        </div>
      </header>

      <div className="mt-8">
        <Link
          href={`/flashcards/decks/${deck.slug}/review`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-base bg-bg-brand px-6 py-3 text-base font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium sm:w-auto"
        >
          Start reviewing this deck
          <ArrowRight className="size-5" aria-hidden />
        </Link>
      </div>

      {preview.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-text-heading">What&apos;s inside</h2>
          <p className="mt-1 text-sm text-text-body">Front prompts only — backs stay hidden until you review.</p>
          <ul className="mt-4 space-y-3">
            {preview.map((c) => (
              <li key={c.id} className="rounded-base border border-border-default bg-bg-primary-soft p-4">
                <p className="text-sm font-medium text-text-heading">{c.front}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
