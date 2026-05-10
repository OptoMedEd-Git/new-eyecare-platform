"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";

import {
  abandonQuizAttempt,
  startOrResumeQuizAttempt,
} from "@/app/(app)/quiz-bank/quizzes/actions";

type Props = {
  quizId: string;
  slug: string;
  hasActiveAttempt: boolean;
  activeAttemptId?: string;
};

export function QuizStartButton({ quizId, slug, hasActiveAttempt, activeAttemptId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStart() {
    setError(null);
    startTransition(async () => {
      const result = await startOrResumeQuizAttempt(quizId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/quiz-bank/quizzes/${slug}/take`);
    });
  }

  async function handleAbandonAndStart() {
    if (!activeAttemptId) return;
    if (
      !confirm(
        "Abandon your in-progress attempt? Your answers will be saved but the attempt will be marked abandoned.",
      )
    )
      return;

    setError(null);
    startTransition(async () => {
      const abandonResult = await abandonQuizAttempt(activeAttemptId);
      if (!abandonResult.success) {
        setError(abandonResult.error);
        return;
      }
      const startResult = await startOrResumeQuizAttempt(quizId);
      if (!startResult.success) {
        setError(startResult.error);
        return;
      }
      router.push(`/quiz-bank/quizzes/${slug}/take`);
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {hasActiveAttempt ? (
        <>
          <button
            type="button"
            onClick={handleStart}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs hover:bg-bg-brand-medium disabled:opacity-50"
          >
            Resume attempt
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => void handleAbandonAndStart()}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-base border border-border-default px-5 py-2.5 text-sm font-medium text-text-body hover:bg-bg-secondary-soft disabled:opacity-50"
          >
            <RotateCcw className="size-4" aria-hidden />
            Abandon and start over
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs hover:bg-bg-brand-medium disabled:opacity-50"
        >
          {isPending ? "Starting..." : "Start quiz"}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      )}

      {error ? <p className="text-sm text-text-fg-danger">{error}</p> : null}
    </div>
  );
}
