"use client";

import { abandonQuizAttempt, startOrResumeQuizAttempt } from "@/app/(app)/quiz-bank/quizzes/actions";
import { deleteUserQuiz, renameUserQuiz } from "@/app/(app)/quiz-bank/build/actions";
import type { QuizAttempt, QuizWithQuestions } from "@/lib/quiz-bank/types";
import { ArrowRight, Clock, ListChecks, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  quiz: QuizWithQuestions;
  activeAttempt: QuizAttempt | null;
};

export function MyQuizOverview({ quiz, activeAttempt }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(quiz.title);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(quiz.title);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const hasActiveAttempt = activeAttempt?.status === "in_progress";

  function handleRename() {
    setError(null);
    start(async () => {
      const r = await renameUserQuiz(quiz.id, draftTitle);
      if (!r.success) {
        setError(r.error);
        return;
      }
      setTitle(draftTitle.trim());
      setEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Delete this quiz and all attempts? This cannot be undone.")) return;
    setError(null);
    start(async () => {
      const r = await deleteUserQuiz(quiz.id);
      if (!r.success) {
        setError(r.error);
        return;
      }
      router.push("/quiz-bank/my-quizzes");
      router.refresh();
    });
  }

  function handleStart() {
    setError(null);
    start(async () => {
      const result = await startOrResumeQuizAttempt(quiz.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/quiz-bank/my-quizzes/${quiz.id}/take`);
    });
  }

  function handleAbandonAndStart() {
    if (!activeAttempt || activeAttempt.status !== "in_progress") return;
    if (
      !confirm(
        "Abandon your in-progress attempt? Your answers will be saved but the attempt will be marked abandoned.",
      )
    )
      return;
    setError(null);
    start(async () => {
      const abandonResult = await abandonQuizAttempt(activeAttempt.id);
      if (!abandonResult.success) {
        setError(abandonResult.error);
        return;
      }
      const startResult = await startOrResumeQuizAttempt(quiz.id);
      if (!startResult.success) {
        setError(startResult.error);
        return;
      }
      router.push(`/quiz-bank/my-quizzes/${quiz.id}/take`);
    });
  }

  return (
    <>
      <header className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full max-w-xl rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-2xl font-bold text-text-heading shadow-xs outline-none focus:border-border-brand focus:ring-4 focus:ring-ring-brand lg:text-3xl"
                  aria-label="Quiz title"
                />
                <button
                  type="button"
                  onClick={() => void handleRename()}
                  disabled={pending}
                  className="rounded-base bg-bg-brand px-3 py-1.5 text-sm font-medium text-text-on-brand hover:bg-bg-brand-medium disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftTitle(title);
                    setEditing(false);
                  }}
                  className="rounded-base border border-border-default px-3 py-1.5 text-sm font-medium text-text-body hover:bg-bg-secondary-soft"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">{title}</h1>
                <button
                  type="button"
                  onClick={() => {
                    setDraftTitle(title);
                    setEditing(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-base border border-border-default p-2 text-text-muted hover:bg-bg-secondary-soft hover:text-text-heading"
                  aria-label="Rename quiz"
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-base border border-border-danger px-4 py-2 text-sm font-medium text-text-fg-danger hover:bg-bg-danger-softer disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden />
            Delete quiz
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {quiz.category ? (
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {quiz.category.name}
            </span>
          ) : null}
          {quiz.difficulty ? (
            <span className="text-xs font-medium capitalize text-text-muted">{quiz.difficulty}</span>
          ) : null}
          {quiz.audience ? (
            <>
              <span className="text-text-muted" aria-hidden>
                ·
              </span>
              <span className="text-xs font-medium capitalize text-text-muted">
                {quiz.audience === "all" ? "All clinicians" : quiz.audience}
              </span>
            </>
          ) : null}
        </div>
      </header>

      {error ? (
        <p className="mt-4 rounded-base border border-border-danger bg-bg-danger-softer p-3 text-sm text-text-fg-danger">
          {error}
        </p>
      ) : null}

      <section className="mt-8 rounded-base border border-border-default bg-bg-primary-soft p-6">
        <h2 className="text-base font-bold text-text-heading">Quiz details</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <ListChecks className="mt-0.5 size-5 text-text-fg-brand-strong" aria-hidden />
            <div>
              <dt className="text-xs font-medium text-text-muted">Questions</dt>
              <dd className="mt-0.5 text-sm font-medium text-text-heading">{quiz.questions.length}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 text-text-fg-brand-strong" aria-hidden />
            <div>
              <dt className="text-xs font-medium text-text-muted">Time limit</dt>
              <dd className="mt-0.5 text-sm font-medium text-text-heading">
                {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} minutes` : "None (untimed)"}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {hasActiveAttempt ? (
            <>
              <button
                type="button"
                onClick={() => void handleStart()}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs hover:bg-bg-brand-medium disabled:opacity-50"
              >
                Resume attempt
                <ArrowRight className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => void handleAbandonAndStart()}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-base border border-border-default px-5 py-2.5 text-sm font-medium text-text-body hover:bg-bg-secondary-soft disabled:opacity-50"
              >
                <RotateCcw className="size-4" aria-hidden />
                Abandon and start over
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void handleStart()}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs hover:bg-bg-brand-medium disabled:opacity-50"
            >
              {pending ? "Starting..." : "Start quiz"}
              <ArrowRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </section>
    </>
  );
}
