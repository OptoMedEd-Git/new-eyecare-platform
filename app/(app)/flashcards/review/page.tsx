import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";

import { FlashcardReviewOrchestrator } from "@/components/flashcards/FlashcardReviewOrchestrator";
import { getActiveFlashcardCategories, getFlaggedFlashcardIds } from "@/lib/flashcards/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Flashcards — Review" };

export default async function FlashcardReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [categories, flaggedFlashcardIds] = await Promise.all([
    getActiveFlashcardCategories(),
    getFlaggedFlashcardIds(),
  ]);

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
        <span className="font-medium text-text-heading">Review</span>
      </nav>

      <Link
        href="/flashcards"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to flashcards
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">Review mode</h1>
        <p className="mt-2 text-base text-text-body">Flip each card, rate how well you knew it, continue.</p>
      </header>

      <div className="mt-6">
        <FlashcardReviewOrchestrator categoryOptions={categories} initialFlaggedFlashcardIds={flaggedFlashcardIds} />
      </div>
    </div>
  );
}
