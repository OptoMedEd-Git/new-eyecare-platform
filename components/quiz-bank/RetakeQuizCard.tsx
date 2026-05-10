import Link from "next/link";
import { ArrowRight, BookOpenCheck, RotateCcw } from "lucide-react";

import type { Quiz } from "@/lib/quiz-bank/types";

type Props = { quiz: Quiz };

export function RetakeQuizCard({ quiz }: Props) {
  const slug = quiz.slug ?? "";

  return (
    <section className="rounded-base border border-border-default bg-bg-primary-soft p-6">
      <h2 className="text-lg font-bold text-text-heading">What&apos;s next?</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={slug ? `/quiz-bank/quizzes/${slug}` : "/quiz-bank/quizzes"}
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
          href="/quiz-bank/quizzes"
          className="group flex items-start gap-3 rounded-base border border-border-default bg-bg-primary-soft p-4 transition-colors hover:border-border-brand-subtle hover:bg-bg-secondary-soft"
        >
          <BookOpenCheck className="mt-0.5 size-5 shrink-0 text-text-fg-brand-strong" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-heading group-hover:text-text-fg-brand-strong">Browse more quizzes</p>
            <p className="mt-1 text-sm text-text-body">Find another curated quiz on a different topic.</p>
          </div>
          <ArrowRight className="mt-1 size-4 shrink-0 text-text-muted transition-colors group-hover:text-text-fg-brand-strong" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
