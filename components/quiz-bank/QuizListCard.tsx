import Link from "next/link";
import { ArrowRight, Clock, ListChecks, Star } from "lucide-react";

import type { QuizListing } from "@/lib/quiz-bank/types";

type Props = { quiz: QuizListing };

export function QuizListCard({ quiz }: Props) {
  return (
    <Link
      href={`/quiz-bank/quizzes/${quiz.slug}`}
      className="group flex flex-col rounded-base border border-border-default bg-bg-primary-soft p-5 transition-colors hover:border-border-brand-subtle hover:bg-bg-secondary-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {quiz.category ? (
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {quiz.category.name}
            </span>
          ) : null}
          {quiz.difficulty ? (
            <span className="text-xs font-medium capitalize text-text-muted">{quiz.difficulty}</span>
          ) : null}
        </div>
        {quiz.isFeatured ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-text-fg-brand-strong">
            <Star className="size-3 fill-current" aria-hidden />
            Featured
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-lg font-bold text-text-heading transition-colors group-hover:text-text-fg-brand-strong">
        {quiz.title}
      </h3>
      {quiz.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-text-body">{quiz.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1">
          <ListChecks className="size-3.5" aria-hidden />
          {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "Untimed"}
        </span>
        {quiz.audience ? (
          <span className="capitalize">{quiz.audience === "all" ? "All clinicians" : quiz.audience}</span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-end gap-1 text-sm font-medium text-text-fg-brand-strong opacity-0 transition-opacity group-hover:opacity-100">
        Start quiz
        <ArrowRight className="size-4" aria-hidden />
      </div>
    </Link>
  );
}
