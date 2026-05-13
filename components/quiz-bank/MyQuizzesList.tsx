"use client";

import { deleteUserQuiz } from "@/app/(app)/quiz-bank/build/actions";
import type { UserQuizListItem } from "@/lib/quiz-bank/queries";
import { ArrowRight, Clock, ListChecks, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = { items: UserQuizListItem[] };

export function MyQuizzesList({ items }: Props) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  if (items.length === 0) {
    return (
      <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
        <ListChecks className="mx-auto size-8 text-text-muted" aria-hidden />
        <p className="mt-3 text-base font-medium text-text-heading">No custom quizzes yet</p>
        <p className="mt-1 text-sm text-text-body">
          Build a quiz from your filters — flagged questions, categories, difficulty, and more.
        </p>
        <Link
          href="/quiz-bank/build"
          className="mt-6 inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
        >
          Build your first quiz
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  function handleDelete(quizId: string) {
    if (!confirm("Delete this quiz and all attempts?")) return;
    start(async () => {
      const r = await deleteUserQuiz(quizId);
      if (r.success) {
        router.refresh();
      }
    });
  }

  return (
    <ul className="space-y-4">
      {items.map(({ quiz, latestAttempt }) => {
        const overviewHref = `/quiz-bank/my-quizzes/${quiz.id}`;
        const takeHref = `/quiz-bank/my-quizzes/${quiz.id}/take`;
        const inProgress = latestAttempt?.status === "in_progress";
        const submitted = latestAttempt?.status === "submitted";
        const correct = latestAttempt?.scoreCorrect ?? 0;
        const total = latestAttempt?.scoreTotal ?? 0;
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

        return (
          <li key={quiz.id}>
            <article className="rounded-base border border-border-default bg-bg-primary-soft p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={overviewHref}
                    className="text-lg font-bold text-text-heading transition-colors hover:text-text-fg-brand-strong"
                  >
                    {quiz.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <ListChecks className="size-3.5" aria-hidden />
                      {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden />
                      {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "Untimed"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-text-body">
                    {inProgress ? (
                      <span className="font-medium text-text-fg-brand-strong">In progress</span>
                    ) : submitted ? (
                      <>
                        <span className="font-medium text-text-heading">
                          Completed · {correct}/{total} ({pct}%)
                        </span>
                      </>
                    ) : latestAttempt?.status === "abandoned" ? (
                      <span className="text-text-muted">Last attempt abandoned</span>
                    ) : (
                      <span className="text-text-muted">Not started</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {inProgress ? (
                    <Link
                      href={takeHref}
                      className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
                    >
                      Continue
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  ) : submitted && latestAttempt ? (
                    <Link
                      href={`/quiz-bank/my-quizzes/${quiz.id}/results/${latestAttempt.id}`}
                      className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
                    >
                      Review results
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  ) : (
                    <Link
                      href={overviewHref}
                      className="inline-flex items-center gap-1.5 rounded-base border border-border-default px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft"
                    >
                      Open
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(quiz.id)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 rounded-base border border-border-default p-2 text-text-muted transition-colors hover:border-border-danger hover:text-text-fg-danger disabled:opacity-50"
                    aria-label="Delete quiz"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
