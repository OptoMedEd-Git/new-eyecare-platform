import {
  BookOpenCheck,
  ChevronRight,
  ClipboardList,
  CircleHelp,
  Home,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { AccuracyOverTimeChart } from "@/components/quiz-bank/AccuracyOverTimeChart";
import { CategoryAccuracyChart } from "@/components/quiz-bank/CategoryAccuracyChart";
import { ContinueLearningCard } from "@/components/quiz-bank/ContinueLearningCard";
import { FeaturedQuizCard } from "@/components/quiz-bank/FeaturedQuizCard";
import { FlaggedSummaryCard } from "@/components/quiz-bank/FlaggedSummaryCard";
import { ModeCard } from "@/components/quiz-bank/ModeCard";
import {
  getFeaturedQuiz,
  getFlaggedCount,
  getLastQuizAttempt,
  getQuizBankDashboardData,
  getRecentFlaggedQuestions,
  getRecentPracticeActivity,
} from "@/lib/quiz-bank/queries";

export default async function QuizBankPage() {
  const [dashboard, featuredQuiz, flaggedCount, recentFlagged, recentPractice, lastQuizAttempt] = await Promise.all([
    getQuizBankDashboardData(),
    getFeaturedQuiz(),
    getFlaggedCount(),
    getRecentFlaggedQuestions(3),
    getRecentPracticeActivity(3),
    getLastQuizAttempt(),
  ]);
  const { stats, accuracyPct, unansweredCount, categoryAccuracy, accuracyOverTime } = dashboard;

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

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
        <StatTile
          icon={CircleHelp}
          label="Unanswered"
          value={unansweredCount.toString()}
          sublabel={stats.totalAnswered === 0 ? "Full bank available" : null}
        />
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-text-heading">Your performance</h2>
        <p className="mt-2 max-w-2xl text-sm text-text-body">
          Trends use practice-mode answers only. Formal quiz attempts are tracked separately on each quiz&apos;s results
          page.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          <CategoryAccuracyChart data={categoryAccuracy} />
          <AccuracyOverTimeChart data={accuracyOverTime} />
        </div>
      </section>

      <section className="mt-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          <FlaggedSummaryCard totalCount={flaggedCount} recent={recentFlagged} />
          <ContinueLearningCard recentPractice={recentPractice} lastQuizAttempt={lastQuizAttempt} />
        </div>
      </section>

      {featuredQuiz ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-text-heading">Featured</h2>
          <p className="mt-1 text-sm text-text-body">A quick recommendation to jump in.</p>
          <div className="mt-6">
            <FeaturedQuizCard quiz={featuredQuiz} />
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-xl font-bold text-text-heading">Modes</h2>
        <p className="mt-2 max-w-2xl text-sm text-text-body">
          Pick a mode that fits your study block — quick drills, structured quizzes, or a custom mix later on.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          <ModeCard
            variant="interactive"
            href="/quiz-bank/practice"
            icon={BookOpenCheck}
            title="Practice mode"
            description="Answer questions one at a time with immediate feedback and explanations. Filter by category, audience, or difficulty."
            ctaLabel="Start practicing"
          />
          <ModeCard
            variant="interactive"
            href="/quiz-bank/quizzes"
            icon={ClipboardList}
            title="Pre-made quizzes"
            description="Curated quiz collections on focused clinical topics with structured pacing."
            ctaLabel="Browse quizzes"
          />
          <ModeCard
            variant="interactive"
            href="/quiz-bank/build"
            icon={Sparkles}
            title="Build your own quiz"
            description="Pick categories, number of questions, and timing to generate a custom quiz."
            ctaLabel="Build a quiz"
          />
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
