import type { PastQuizAttemptSummary } from "@/lib/quiz-bank/types";
import { pastQuizAttemptResultsHref } from "@/lib/quiz-bank/queries";
import { formatRelativeTime } from "@/lib/blog/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ArrowRight, ClipboardList, ListChecks } from "lucide-react";
import Link from "next/link";

type SectionProps = {
  attempts: PastQuizAttemptSummary[];
  hasMore: boolean;
};

export function ReviewPreviousQuizzesSection({ attempts, hasMore }: SectionProps) {
  if (attempts.length === 0) {
    return (
      <article className="flex min-w-0 flex-col rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-6">
        <h2 className="text-xl font-bold text-text-heading">Review previous quizzes</h2>
        <p className="mt-2 text-sm text-text-body">
          You haven&apos;t completed any quizzes yet. When you finish a curated or custom quiz, it will show up here
          so you can reopen the results anytime.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/quiz-bank/quizzes"
            className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
          >
            Browse quizzes
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/quiz-bank/build"
            className="inline-flex items-center gap-1.5 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary-soft"
          >
            Build a quiz
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="flex min-w-0 flex-col rounded-base border border-border-default bg-bg-primary-soft p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-heading">Review previous quizzes</h2>
          <p className="mt-1 text-sm text-text-body">
            Curated and custom quizzes you&apos;ve completed — newest first.
          </p>
        </div>
        {hasMore ? (
          <Link
            href="/quiz-bank/attempts"
            className="shrink-0 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
          >
            View all
            <ArrowRight className="mb-0.5 ml-0.5 inline size-4 align-middle" aria-hidden />
          </Link>
        ) : null}
      </header>

      <PastQuizAttemptList attempts={attempts} className="mt-4" />
    </article>
  );
}

export function PastQuizAttemptList({
  attempts,
  className = "",
}: {
  attempts: PastQuizAttemptSummary[];
  className?: string;
}) {
  return (
    <ul
      className={`divide-y divide-border-default rounded-base border border-border-default bg-bg-secondary-soft ${className}`.trim()}
    >
      {attempts.map((a) => (
        <li key={a.attemptId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="line-clamp-2 font-medium text-text-heading">{a.quizTitle}</p>
              <KindBadge kind={a.quizKind} />
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {a.questionCount} {a.questionCount === 1 ? "question" : "questions"} · {formatRelativeTime(a.submittedAt)}
            </p>
            <div className="mt-2 max-w-md">
              <div className="flex items-baseline justify-between gap-2 text-xs text-text-muted">
                <span>Score</span>
                <span className="font-medium text-text-heading">
                  {a.scoreCorrect}/{a.scoreTotal}
                  {a.scoreTotal > 0 ? ` (${Math.round((a.scoreCorrect / a.scoreTotal) * 100)}%)` : ""}
                </span>
              </div>
              <ProgressBar
                className="mt-1"
                value={Math.min(Math.max(0, a.scoreCorrect), Math.max(1, a.scoreTotal))}
                max={Math.max(1, a.scoreTotal)}
                showAtZero
                size="sm"
                ariaLabel="Score"
              />
            </div>
          </div>
          <Link
            href={pastQuizAttemptResultsHref(a)}
            className="inline-flex shrink-0 items-center gap-1 self-start rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary-soft sm:self-center"
          >
            See results
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function KindBadge({ kind }: { kind: PastQuizAttemptSummary["quizKind"] }) {
  if (kind === "curated") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
        <ClipboardList className="size-3" aria-hidden />
        Curated
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-border-default bg-bg-secondary-soft px-2 py-0.5 text-xs font-medium text-text-muted">
      <ListChecks className="size-3" aria-hidden />
      Your quiz
    </span>
  );
}
