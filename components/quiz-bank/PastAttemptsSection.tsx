"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ChevronUp, History } from "lucide-react";

import type { Quiz, QuizAttempt } from "@/lib/quiz-bank/types";

type Props = {
  pastAttempts: QuizAttempt[];
  currentAttemptId: string;
  quiz: Quiz;
};

function attemptResultsHref(quiz: Quiz, attemptId: string): string {
  if (quiz.kind === "user_generated") {
    return `/quiz-bank/my-quizzes/${quiz.id}/results/${attemptId}`;
  }
  if (quiz.slug) {
    return `/quiz-bank/quizzes/${quiz.slug}/results/${attemptId}`;
  }
  return "/quiz-bank/quizzes";
}

export function PastAttemptsSection({ pastAttempts, currentAttemptId, quiz }: Props) {
  const others = pastAttempts.filter((a) => a.id !== currentAttemptId);
  const [expanded, setExpanded] = useState(false);

  if (others.length === 0) return null;

  return (
    <section className="rounded-base border border-border-default bg-bg-primary-soft">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium text-text-heading">
          <History className="size-4 text-text-muted" aria-hidden />
          Past attempts on this quiz
          <span className="text-text-muted">({others.length})</span>
        </span>
        {expanded ? (
          <ChevronUp className="size-4 text-text-muted" aria-hidden />
        ) : (
          <ChevronDown className="size-4 text-text-muted" aria-hidden />
        )}
      </button>

      {expanded ? (
        <ul className="divide-y divide-border-default border-t border-border-default">
          {others.map((attempt) => {
            const correct = attempt.scoreCorrect ?? 0;
            const total = attempt.scoreTotal ?? 0;
            const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
            return (
              <li key={attempt.id}>
                <Link
                  href={attemptResultsHref(quiz, attempt.id)}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-bg-secondary-soft"
                >
                  <div>
                    <p className="font-medium text-text-heading">
                      {correct}/{total} · {pct}%
                    </p>
                    {attempt.submittedAt ? (
                      <p className="text-xs text-text-muted">{new Date(attempt.submittedAt).toLocaleString()}</p>
                    ) : null}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-text-muted" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
