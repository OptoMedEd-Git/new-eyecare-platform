import Link from "next/link";
import { ArrowRight, BookOpenCheck, RotateCcw, Sparkles } from "lucide-react";

import type { Quiz } from "@/lib/quiz-bank/types";

type Props = { quiz: Quiz };

export function RetakeQuizCard({ quiz }: Props) {
  const retakeHref =
    quiz.kind === "user_generated"
      ? `/quiz-bank/my-quizzes/${quiz.id}`
      : quiz.slug
        ? `/quiz-bank/quizzes/${quiz.slug}`
        : "/quiz-bank/quizzes";

  const secondaryHref = quiz.kind === "user_generated" ? "/quiz-bank/build" : "/quiz-bank/quizzes";
  const SecondaryIcon = quiz.kind === "user_generated" ? Sparkles : BookOpenCheck;
  const secondaryTitle = quiz.kind === "user_generated" ? "Build a new quiz" : "Browse more quizzes";
  const secondaryBody =
    quiz.kind === "user_generated"
      ? "Create another custom set with different filters and timing."
      : "Find another curated quiz on a different topic.";

  return (
    <section className="rounded-base border border-border-default bg-bg-primary-soft p-6">
      <h2 className="text-lg font-bold text-text-heading">What&apos;s next?</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={retakeHref}
          className="group flex items-start gap-3 rounded-base border border-border-default bg-bg-primary-soft p-4 transition-colors hover:border-border-brand-subtle hover:bg-bg-secondary-soft"
        >
          <RotateCcw className="mt-0.5 size-5 shrink-0 text-text-fg-brand-strong" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-heading group-hover:text-text-fg-brand-strong">Take this quiz again</p>
            <p className="mt-1 text-sm text-text-body">Start a fresh attempt with the same questions.</p>
          </div>
          <ArrowRight className="mt-1 size-4 shrink-0 text-text-muted transition-colors group-hover:text-text-fg-brand-strong" aria-hidden />
        </Link>

        <Link
          href={secondaryHref}
          className="group flex items-start gap-3 rounded-base border border-border-default bg-bg-primary-soft p-4 transition-colors hover:border-border-brand-subtle hover:bg-bg-secondary-soft"
        >
          <SecondaryIcon className="mt-0.5 size-5 shrink-0 text-text-fg-brand-strong" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-heading group-hover:text-text-fg-brand-strong">{secondaryTitle}</p>
            <p className="mt-1 text-sm text-text-body">{secondaryBody}</p>
          </div>
          <ArrowRight className="mt-1 size-4 shrink-0 text-text-muted transition-colors group-hover:text-text-fg-brand-strong" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
