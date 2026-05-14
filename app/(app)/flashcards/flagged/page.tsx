import { ArrowLeft, ChevronRight, Flag, Home } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FlaggedFlashcardsList } from "@/components/flashcards/FlaggedFlashcardsList";
import { getFlaggedFlashcardsForUser } from "@/lib/flashcards/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Flashcards — Flagged" };

export default async function FlaggedFlashcardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const entries = await getFlaggedFlashcardsForUser();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
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
        <span className="font-medium text-text-heading">Flagged</span>
      </nav>

      <Link
        href="/flashcards"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to flashcards
      </Link>

      <header className="mt-4">
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">
          <Flag className="size-7 text-text-fg-brand-strong" fill="currentColor" aria-hidden />
          Flagged flashcards
        </h1>
        <p className="mt-2 max-w-2xl text-base text-text-body">
          Cards you&apos;ve flagged for review. Remove the flag once you&apos;ve mastered the concept.
        </p>
      </header>

      <div className="mt-8">
        <FlaggedFlashcardsList entries={entries} />
      </div>
    </div>
  );
}
