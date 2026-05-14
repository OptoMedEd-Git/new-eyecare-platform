import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ChevronRight, Home } from "lucide-react";

import { FlaggedFlashcardsSummaryCard } from "@/components/flashcards/FlaggedFlashcardsSummaryCard";
import {
  getFlashcardReviewStats,
  getFlaggedFlashcardCount,
  getRecentFlaggedFlashcards,
} from "@/lib/flashcards/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Flashcards" };

export default async function FlashcardsLandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [stats, flaggedCount, recentFlagged] = await Promise.all([
    getFlashcardReviewStats(),
    getFlaggedFlashcardCount(),
    getRecentFlaggedFlashcards(3),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-text-muted transition-colors hover:text-text-heading"
        >
          <Home className="size-4" aria-hidden />
          Home
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">Flashcards</span>
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">Flashcards</h1>
        <p className="mt-2 max-w-2xl text-base text-text-body">
          Active-recall practice. Flip cards, self-rate, build retention over time.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total reviews" value={stats.totalReviews.toString()} />
        <StatTile label="Unique cards" value={`${stats.uniqueCardsReviewed} / ${stats.totalCardsPublished}`} />
        <StatTile
          label="Knew well"
          value={stats.lastRatingDistribution.good.toString()}
          colorClass="text-text-fg-success-strong"
        />
        <StatTile
          label="Need review"
          value={(stats.lastRatingDistribution.again + stats.lastRatingDistribution.hard).toString()}
          colorClass="text-text-fg-warning-strong"
        />
      </section>

      <section className="mt-10">
        <FlaggedFlashcardsSummaryCard totalCount={flaggedCount} recent={recentFlagged} />
      </section>

      <section className="mt-10">
        <div className="rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-xs">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-text-heading">Start a review session</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-body">
                Flip through flashcards one at a time. Self-rate how well you knew each one. Filter by category,
                audience, or difficulty to focus your review.
              </p>
            </div>
            <Link
              href="/flashcards/review"
              className="inline-flex shrink-0 items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
            >
              Start reviewing
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-5 shadow-xs">
      <div className="text-sm text-text-muted">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${colorClass ?? "text-text-heading"}`}>{value}</div>
    </div>
  );
}
