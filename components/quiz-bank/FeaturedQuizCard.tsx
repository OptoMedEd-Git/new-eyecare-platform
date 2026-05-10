import Link from "next/link";
import { ArrowRight, Clock, ListChecks, Star } from "lucide-react";

import type { QuizListing } from "@/lib/quiz-bank/types";

type Props = { quiz: QuizListing };

export function FeaturedQuizCard({ quiz }: Props) {
  if (!quiz.slug) return null;

  return (
    <Link
      href={`/quiz-bank/quizzes/${quiz.slug}`}
      className="group flex flex-col gap-4 rounded-base border border-border-default bg-bg-primary-soft p-6 transition-colors hover:border-border-brand-subtle hover:bg-bg-secondary-soft sm:flex-row sm:items-center sm:gap-6"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-base bg-bg-brand-softer text-text-fg-brand-strong">
        <Star className="size-6 fill-current" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-fg-brand-strong">
          <span className="font-medium uppercase tracking-wide">Featured quiz</span>
          {quiz.category ? (
            <>
              <span className="text-text-muted" aria-hidden>
                ·
              </span>
              <span className="text-text-muted">{quiz.category.name}</span>
            </>
          ) : null}
        </div>

        <h3 className="mt-2 text-lg font-bold text-text-heading transition-colors group-hover:text-text-fg-brand-strong">
          {quiz.title}
        </h3>
        {quiz.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-text-body">{quiz.description}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <ListChecks className="size-3.5" aria-hidden />
            {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {quiz.timeLimitMinutes != null ? `${quiz.timeLimitMinutes} min` : "Untimed"}
          </span>
          {quiz.audience ? (
            <span className="capitalize">
              {quiz.audience === "all" ? "All clinicians" : quiz.audience}
            </span>
          ) : null}
        </div>
      </div>

      <div className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-text-fg-brand-strong">
        Start quiz
        <ArrowRight className="size-4" aria-hidden />
      </div>
    </Link>
  );
}
