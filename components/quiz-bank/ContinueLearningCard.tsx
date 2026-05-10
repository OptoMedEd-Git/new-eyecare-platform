import type { LastQuizAttemptSummary, RecentPracticeItem } from "@/lib/quiz-bank/queries";
import { ArrowRight, Check, ListChecks, PlayCircle, X } from "lucide-react";
import Link from "next/link";

type Props = {
  recentPractice: RecentPracticeItem[];
  lastQuizAttempt: LastQuizAttemptSummary | null;
};

export function ContinueLearningCard({ recentPractice, lastQuizAttempt }: Props) {
  const hasPractice = recentPractice.length > 0;
  const hasQuiz = lastQuizAttempt !== null;

  if (hasPractice) {
    return (
      <article className="flex flex-col rounded-base border border-border-default bg-bg-primary-soft p-6">
        <header>
          <h3 className="inline-flex items-center gap-2 text-base font-bold text-text-heading">
            <PlayCircle className="size-5 text-text-fg-brand-strong" aria-hidden />
            Continue where you left off
          </h3>
          <p className="mt-1 text-sm text-text-body">Pick up your practice session.</p>
        </header>

        <ul className="mt-4 flex-1 space-y-3">
          {recentPractice.map((item) => (
            <li
              key={`${item.questionId}-${item.answeredAt}`}
              className="flex items-start gap-3 border-t border-border-default pt-3"
            >
              <span
                className={[
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  item.isCorrect ? "bg-bg-success-softer text-text-fg-success-strong" : "bg-bg-danger-softer text-text-fg-danger",
                ].join(" ")}
                aria-label={item.isCorrect ? "Correct" : "Incorrect"}
              >
                {item.isCorrect ? <Check className="size-3" aria-hidden /> : <X className="size-3" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1">
                {item.category ? (
                  <p className="text-xs font-medium text-text-fg-brand-strong">{item.category.name}</p>
                ) : null}
                <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-text-heading">
                  {item.questionText}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/quiz-bank/practice"
          className="mt-5 inline-flex items-center gap-1.5 self-start rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
        >
          Continue practicing
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </article>
    );
  }

  if (hasQuiz && lastQuizAttempt) {
    const pct =
      lastQuizAttempt.scoreTotal > 0
        ? Math.round((lastQuizAttempt.scoreCorrect / lastQuizAttempt.scoreTotal) * 100)
        : 0;

    return (
      <article className="flex flex-col rounded-base border border-border-default bg-bg-primary-soft p-6">
        <header>
          <h3 className="inline-flex items-center gap-2 text-base font-bold text-text-heading">
            <ListChecks className="size-5 text-text-fg-brand-strong" aria-hidden />
            Continue where you left off
          </h3>
          <p className="mt-1 text-sm text-text-body">Review your most recent quiz.</p>
        </header>

        <div className="mt-4 flex-1 rounded-base border border-border-default bg-bg-secondary-soft p-4">
          <p className="line-clamp-2 text-sm font-medium text-text-heading">{lastQuizAttempt.quizTitle}</p>
          <p className="mt-2 text-sm text-text-body">
            Score:{" "}
            <span className="font-bold text-text-heading">
              {lastQuizAttempt.scoreCorrect}/{lastQuizAttempt.scoreTotal}
            </span>{" "}
            ({pct}%)
          </p>
          <p className="mt-1 text-xs text-text-muted">{new Date(lastQuizAttempt.submittedAt).toLocaleDateString()}</p>
        </div>

        <Link
          href={
            lastQuizAttempt.quizSlug
              ? `/quiz-bank/quizzes/${lastQuizAttempt.quizSlug}/results/${lastQuizAttempt.attemptId}`
              : "/quiz-bank/quizzes"
          }
          className="mt-5 inline-flex items-center gap-1.5 self-start rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
        >
          Review results
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </article>
    );
  }

  return (
    <article className="flex flex-col rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-6">
      <h3 className="inline-flex items-center gap-2 text-base font-bold text-text-heading">
        <PlayCircle className="size-5 text-text-muted" aria-hidden />
        Get started
      </h3>
      <p className="mt-2 flex-1 text-sm text-text-body">
        Practice mode lets you work through questions one at a time with immediate feedback. Filter by category,
        audience, or difficulty.
      </p>

      <Link
        href="/quiz-bank/practice"
        className="mt-5 inline-flex items-center gap-1.5 self-start rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
      >
        Start practicing
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}
