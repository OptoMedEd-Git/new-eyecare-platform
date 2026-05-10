import { BookOpenCheck, ChevronRight, Home, Target, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { getPracticeStats } from "@/lib/quiz-bank/queries";

export default async function QuizBankPage() {
  const stats = await getPracticeStats();
  const accuracyPct = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

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
        <span className="font-medium text-text-heading">Quiz bank</span>
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">Quiz bank</h1>
        <p className="mt-2 max-w-2xl text-base text-text-body">
          Board-style practice questions across the eye care domain. Drill specific categories or work through random
          questions to build broad coverage.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={BookOpenCheck}
          label="Questions answered"
          value={stats.totalAnswered.toString()}
          sublabel={
            stats.totalUniqueQuestionsAnswered === stats.totalAnswered || stats.totalAnswered === 0
              ? null
              : `${stats.totalUniqueQuestionsAnswered} unique`
          }
        />
        <StatTile icon={Target} label="Correct" value={stats.totalCorrect.toString()} sublabel={null} />
        <StatTile
          icon={TrendingUp}
          label="Accuracy"
          value={stats.totalAnswered > 0 ? `${accuracyPct}%` : "—"}
          sublabel={stats.totalAnswered === 0 ? "No answers yet" : null}
        />
      </section>

      <section className="mt-10">
        <div className="rounded-base border border-border-default bg-bg-primary-soft p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-text-heading">Practice mode</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-body">
                Answer questions one at a time with immediate feedback and explanations. Filter by category, audience, or
                difficulty to focus your practice.
              </p>
            </div>
            <Link
              href="/quiz-bank/practice"
              className="inline-flex shrink-0 items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
            >
              Start practicing
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/quiz-bank/quizzes"
          className="group rounded-base border border-border-default bg-bg-primary-soft p-6 transition-colors hover:border-border-brand-subtle hover:bg-bg-secondary-soft"
        >
          <h3 className="text-base font-bold text-text-heading group-hover:text-text-fg-brand-strong">Pre-made quizzes</h3>
          <p className="mt-1 text-sm text-text-body">Curated quiz collections on focused clinical topics.</p>
        </Link>
        <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-6">
          <h3 className="text-base font-bold text-text-muted">Build your own quiz</h3>
          <p className="mt-1 text-sm text-text-muted">Coming soon</p>
        </div>
      </section>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel: string | null;
}) {
  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-5">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Icon className="size-4" aria-hidden />
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-text-heading">{value}</div>
      {sublabel ? <div className="mt-1 text-xs text-text-muted">{sublabel}</div> : null}
    </div>
  );
}
