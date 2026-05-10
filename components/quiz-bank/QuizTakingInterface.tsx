"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Send } from "lucide-react";

import { saveAnswerToAttempt, submitQuizAttempt } from "@/app/(app)/quiz-bank/quizzes/actions";
import type { QuizAttempt, QuizWithQuestions } from "@/lib/quiz-bank/types";
import { ProgressBar } from "@/components/shared/ProgressBar";

import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizTimer } from "./QuizTimer";
import { SubmitConfirmDialog } from "./SubmitConfirmDialog";

type Props = {
  quiz: QuizWithQuestions;
  quizSlug: string;
  attempt: QuizAttempt;
  initialResponses: { questionId: string; choiceId: string }[];
};

export function QuizTakingInterface({ quiz, quizSlug, attempt, initialResponses }: Props) {
  const router = useRouter();

  const [answers, setAnswers] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    for (const r of initialResponses) m.set(r.questionId, r.choiceId);
    return m;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startSaving] = useTransition();
  const [isSubmitPending, startSubmitting] = useTransition();

  const totalQuestions = quiz.questions.length;
  const currentQuestion = totalQuestions > 0 ? quiz.questions[currentIndex] : undefined;
  const answeredCount = answers.size;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  function handleSelectChoice(choiceId: string) {
    if (timedOut || !currentQuestion) return;

    const questionId = currentQuestion.id;
    const previousAnswer = answers.get(questionId);

    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, choiceId);
      return next;
    });
    setError(null);

    startSaving(async () => {
      const result = await saveAnswerToAttempt(attempt.id, questionId, choiceId);
      if (!result.success) {
        setAnswers((prev) => {
          const next = new Map(prev);
          if (previousAnswer) next.set(questionId, previousAnswer);
          else next.delete(questionId);
          return next;
        });
        setError(result.error);
      }
    });
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  function handleNext() {
    if (currentIndex < totalQuestions - 1) setCurrentIndex(currentIndex + 1);
  }

  function handleSubmitClick() {
    if (allAnswered) {
      void doSubmit();
    } else {
      setShowSubmitDialog(true);
    }
  }

  function doSubmit() {
    setError(null);
    setShowSubmitDialog(false);
    startSubmitting(async () => {
      const result = await submitQuizAttempt(attempt.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/quiz-bank/quizzes/${quizSlug}/results/${result.data!.attemptId}`);
    });
  }

  const handleTimeout = useCallback(() => {
    setTimedOut(true);
  }, []);

  const timerMinutes = attempt.timeLimitMinutes ?? quiz.timeLimitMinutes;

  if (!currentQuestion || totalQuestions === 0) {
    return (
      <div className="rounded-base border border-border-default bg-bg-secondary-soft p-6 text-sm text-text-body">
        This quiz has no questions yet.
      </div>
    );
  }

  return (
    <>
      <header className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="line-clamp-1 text-base font-bold text-text-heading">{quiz.title}</h1>
            <p className="text-xs text-text-muted">
              Question {currentIndex + 1} of {totalQuestions} · {answeredCount} answered
            </p>
          </div>

          {timerMinutes ? (
            <QuizTimer startedAt={attempt.startedAt} timeLimitMinutes={timerMinutes} onTimeout={handleTimeout} />
          ) : null}
        </div>

        <ProgressBar
          value={answeredCount}
          max={totalQuestions}
          showAtZero
          flushBottom
          ariaLabel={`${answeredCount} of ${totalQuestions} questions answered`}
        />
      </header>

      {timedOut ? (
        <div className="mt-3 flex items-center gap-2 rounded-base border border-border-warning bg-bg-warning-softer p-3 text-sm text-text-fg-warning-strong">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          <span>Time&apos;s up. Your answers are locked. Please submit when ready.</span>
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-base border border-border-danger bg-bg-danger-softer p-3 text-sm text-text-fg-danger">
          {error}
        </div>
      ) : null}

      <div className="mt-4">
        <QuizQuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          selectedChoiceId={answers.get(currentQuestion.id) ?? null}
          onSelectChoice={handleSelectChoice}
          locked={timedOut}
        />
      </div>

      <nav className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleSubmitClick()}
            disabled={isSubmitPending}
            className={[
              "inline-flex items-center gap-2 rounded-base px-5 py-2 text-sm font-medium shadow-xs transition-colors",
              allAnswered
                ? "bg-bg-brand text-text-on-brand hover:bg-bg-brand-medium"
                : "border border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft",
              "disabled:opacity-50",
            ].join(" ")}
          >
            <Send className="size-4" aria-hidden />
            {isSubmitPending ? "Submitting..." : "Submit quiz"}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === totalQuestions - 1}
            className="inline-flex items-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </nav>

      {showSubmitDialog ? (
        <SubmitConfirmDialog
          unanswered={totalQuestions - answeredCount}
          total={totalQuestions}
          onCancel={() => setShowSubmitDialog(false)}
          onConfirm={() => void doSubmit()}
        />
      ) : null}
    </>
  );
}
