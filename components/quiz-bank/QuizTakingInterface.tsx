"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Send } from "lucide-react";

import { saveAnswerToAttempt, submitQuizAttempt } from "@/app/(app)/quiz-bank/quizzes/actions";
import type { QuizAttempt, QuizAttemptSavedResponse, QuizWithQuestions } from "@/lib/quiz-bank/types";
import type { SubmittedQuestionAnswer } from "@/lib/quiz-bank/types";
import { ProgressBar } from "@/components/shared/ProgressBar";

import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizTimer } from "./QuizTimer";
import { SubmitConfirmDialog } from "./SubmitConfirmDialog";

const secondaryBarBtn =
  "inline-flex items-center justify-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-40";

const submitBarBtn =
  "inline-flex items-center justify-center gap-2 rounded-base bg-bg-brand px-5 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50";

function savedResponseToSubmitted(r: QuizAttemptSavedResponse): SubmittedQuestionAnswer {
  if (r.kind === "single_best_answer") {
    return { type: "single_best_answer", selectedChoiceId: r.choiceId };
  }
  if (r.kind === "image_stimulus") {
    return { type: "image_stimulus", selectedChoiceId: r.choiceId };
  }
  if (r.kind === "true_false") {
    return { type: "true_false", value: r.value };
  }
  return { type: "multi_select", selectedChoiceIds: [...r.selectedChoiceIds] };
}

type Props = {
  quiz: QuizWithQuestions;
  attempt: QuizAttempt;
  initialResponses: QuizAttemptSavedResponse[];
  initialFlaggedIds: string[];
};

export function QuizTakingInterface({ quiz, attempt, initialResponses, initialFlaggedIds }: Props) {
  const router = useRouter();

  const [answers, setAnswers] = useState<Map<string, SubmittedQuestionAnswer>>(() => {
    const m = new Map<string, SubmittedQuestionAnswer>();
    for (const r of initialResponses) m.set(r.questionId, savedResponseToSubmitted(r));
    return m;
  });

  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(() => new Set(initialFlaggedIds));

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

  function handleSelectAnswer(answer: SubmittedQuestionAnswer) {
    if (timedOut || !currentQuestion) return;

    const questionId = currentQuestion.id;
    const previousAnswer = answers.get(questionId);

    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, answer);
      return next;
    });
    setError(null);

    startSaving(async () => {
      const result = await saveAnswerToAttempt(attempt.id, questionId, answer);
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

  function handleFlagToggle(questionId: string, nowFlagged: boolean) {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (nowFlagged) next.add(questionId);
      else next.delete(questionId);
      return next;
    });
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
      const attemptId = result.data!.attemptId;
      const resultsPath =
        quiz.kind === "user_generated"
          ? `/quiz-bank/my-quizzes/${quiz.id}/results/${attemptId}`
          : quiz.slug
            ? `/quiz-bank/quizzes/${quiz.slug}/results/${attemptId}`
            : "/quiz-bank/quizzes";
      router.push(resultsPath);
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
          <p className="text-sm text-text-body">
            <span className="font-medium text-text-heading">{answeredCount}</span> of {totalQuestions} answered
          </p>

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

      <div className="mt-4 overflow-hidden rounded-base border border-border-default bg-bg-primary-soft">
        <QuizQuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          selectedAnswer={answers.get(currentQuestion.id) ?? null}
          onSelectAnswer={handleSelectAnswer}
          locked={timedOut}
          initialFlagged={flaggedIds.has(currentQuestion.id)}
          onFlagToggle={(nowFlagged) => handleFlagToggle(currentQuestion.id, nowFlagged)}
          omitOuterFrame
        />

        <nav
          className="grid grid-cols-1 gap-3 border-t border-border-default bg-bg-secondary-soft p-4 sm:grid-cols-3 sm:items-center"
          aria-label="Quiz navigation"
        >
          <div className="flex justify-stretch sm:justify-start">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`${secondaryBarBtn} w-full sm:w-auto`}
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              Previous
            </button>
          </div>
          <div className="flex justify-stretch sm:justify-center">
            <button
              type="button"
              onClick={() => void handleSubmitClick()}
              disabled={isSubmitPending}
              className={`${submitBarBtn} w-full sm:w-auto`}
            >
              <Send className="size-4 shrink-0" aria-hidden />
              {isSubmitPending ? "Submitting..." : "Submit quiz"}
            </button>
          </div>
          <div className="flex justify-stretch sm:justify-end">
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className={`${secondaryBarBtn} w-full sm:w-auto`}
            >
              Next
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </button>
          </div>
        </nav>
      </div>

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
