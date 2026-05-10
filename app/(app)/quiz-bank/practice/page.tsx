import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

import { PracticeOrchestrator } from "@/components/quiz-bank/PracticeOrchestrator";
import { getActiveQuestionCategories, getPracticeStats } from "@/lib/quiz-bank/queries";

export default async function PracticePage() {
  const [categories, stats] = await Promise.all([getActiveQuestionCategories(), getPracticeStats()]);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-text-muted transition-colors hover:text-text-heading"
        >
          <Home className="size-4" aria-hidden />
          Home
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link href="/quiz-bank" className="text-text-muted transition-colors hover:text-text-heading">
          Quiz bank
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">Practice</span>
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">Practice mode</h1>
        <p className="mt-2 text-base text-text-body">
          Answer one question at a time. Get immediate feedback with detailed explanations.
        </p>
      </header>

      <div className="mt-6">
        <PracticeOrchestrator categoryOptions={categories} initialLifetimeStats={stats} />
      </div>
    </div>
  );
}
