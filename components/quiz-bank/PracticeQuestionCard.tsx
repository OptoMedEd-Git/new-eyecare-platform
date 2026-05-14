"use client";

import { submitQuestionResponse } from "@/app/(app)/quiz-bank/actions";
import type { PracticeQuestionResult, SubmittedQuestionAnswer } from "@/lib/quiz-bank/types";
import { isSingleBestAnswerQuestion, isTrueFalseQuestion } from "@/lib/quiz-bank/types";
import { ArrowRight, Check, History, X } from "lucide-react";

import { FlagButton } from "./FlagButton";
import Image from "next/image";
import { useState, useTransition } from "react";

type Props = {
  result: PracticeQuestionResult;
  onNext: () => void;
  onAnswered: (wasCorrect: boolean) => void;
};

type SubmissionState =
  | {
      isCorrect: boolean;
      explanation: string;
      questionType: "single_best_answer";
      correctChoiceId: string;
    }
  | {
      isCorrect: boolean;
      explanation: string;
      questionType: "true_false";
      correctAnswer: boolean;
    };

export function PracticeQuestionCard({ result, onNext, onAnswered }: Props) {
  const { question, previouslyAnswered, previousResult, isFlagged } = result;

  const [selectedMcId, setSelectedMcId] = useState<string | null>(null);
  const [selectedTf, setSelectedTf] = useState<boolean | null>(null);
  const [submission, setSubmission] = useState<SubmissionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitted = Boolean(submission);

  function buildPendingAnswer(): SubmittedQuestionAnswer | null {
    if (isSingleBestAnswerQuestion(question)) {
      if (!selectedMcId) return null;
      return { type: "single_best_answer", selectedChoiceId: selectedMcId };
    }
    if (isTrueFalseQuestion(question)) {
      if (selectedTf === null) return null;
      return { type: "true_false", value: selectedTf };
    }
    return null;
  }

  function handleSubmit() {
    const pending = buildPendingAnswer();
    if (!pending || submitted) return;
    setError(null);
    startTransition(async () => {
      const r = await submitQuestionResponse(question.id, pending);
      if (!r.success) {
        setError(r.error);
        return;
      }
      if (r.questionType === "single_best_answer") {
        setSubmission({
          isCorrect: r.isCorrect,
          correctChoiceId: r.correctChoiceId,
          explanation: r.explanation,
          questionType: "single_best_answer",
        });
      } else {
        setSubmission({
          isCorrect: r.isCorrect,
          correctAnswer: r.correctAnswer,
          explanation: r.explanation,
          questionType: "true_false",
        });
      }
      onAnswered(r.isCorrect);
    });
  }

  return (
    <article className="rounded-base border border-border-default bg-bg-primary-soft">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default p-5">
        <div className="flex flex-wrap items-center gap-2">
          {question.category ? (
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {question.category.name}
            </span>
          ) : null}
          <span className="text-xs font-medium capitalize text-text-muted">{question.difficulty}</span>
          {question.audience ? (
            <>
              <span className="text-text-muted" aria-hidden>
                ·
              </span>
              <span className="text-xs font-medium text-text-muted capitalize">
                {question.audience === "all" ? "All clinicians" : question.audience}
              </span>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {previouslyAnswered ? (
            <span className="inline-flex items-center gap-1 rounded-sm bg-bg-secondary-soft px-2 py-0.5 text-xs font-medium text-text-muted">
              <History className="size-3" aria-hidden />
              Previously {previousResult?.wasCorrect ? "correct" : "incorrect"}
            </span>
          ) : null}
          <FlagButton questionId={question.id} initialFlagged={isFlagged} variant="icon" />
        </div>
      </header>

      <div className="space-y-5 p-5">
        {question.vignette ? (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-text-body">{question.vignette}</div>
        ) : null}

        {question.imageUrl ? (
          <figure>
            <Image
              src={question.imageUrl}
              alt="Question image"
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, 672px"
              className="w-full max-w-2xl rounded-base border border-border-default"
            />
            {question.imageAttribution ? (
              <figcaption className="mt-1 text-xs text-text-muted">{question.imageAttribution}</figcaption>
            ) : null}
          </figure>
        ) : null}

        <p className="text-base font-medium leading-relaxed text-text-heading">{question.questionText}</p>

        {isSingleBestAnswerQuestion(question) ? (
          <ol className="space-y-2">
            {question.choices.map((choice, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = selectedMcId === choice.id;
              const showCorrect =
                submission?.questionType === "single_best_answer" && choice.id === submission.correctChoiceId;
              const showIncorrectPick =
                submission &&
                !submission.isCorrect &&
                submission.questionType === "single_best_answer" &&
                selectedMcId === choice.id;

              let classes =
                "flex w-full items-start gap-3 rounded-base border px-4 py-3 text-left text-sm transition-colors";
              if (submitted) {
                if (showCorrect) {
                  classes +=
                    " border-border-success-subtle bg-bg-success-softer text-text-heading";
                } else if (showIncorrectPick) {
                  classes +=
                    " border-border-danger-subtle bg-bg-danger-softer text-text-heading";
                } else {
                  classes +=
                    " border-border-default bg-bg-primary-soft text-text-body opacity-60";
                }
              } else if (isSelected) {
                classes += " border-border-brand bg-bg-brand-softer text-text-heading";
              } else {
                classes +=
                  " border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft";
              }

              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    onClick={() => !submitted && setSelectedMcId(choice.id)}
                    disabled={submitted}
                    className={classes}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-secondary-soft text-xs font-bold text-text-muted">
                      {submitted && showCorrect ? (
                        <Check className="size-3.5 text-text-fg-success-strong" aria-hidden />
                      ) : submitted && showIncorrectPick ? (
                        <X className="size-3.5 text-text-fg-danger-strong" aria-hidden />
                      ) : (
                        letter
                      )}
                    </span>
                    <span className="flex-1 leading-relaxed">{choice.text}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : null}

        {isTrueFalseQuestion(question) ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {([true, false] as const).map((value) => {
              const label = value ? "True" : "False";
              const isSelected = selectedTf === value;
              const showCorrect =
                submission?.questionType === "true_false" && value === submission.correctAnswer;
              const showIncorrectPick =
                submission &&
                !submission.isCorrect &&
                submission.questionType === "true_false" &&
                selectedTf === value;

              let classes =
                "flex w-full items-center justify-center rounded-base border px-4 py-4 text-sm font-semibold transition-colors";
              if (submitted) {
                if (showCorrect) {
                  classes +=
                    " border-border-success-subtle bg-bg-success-softer text-text-heading";
                } else if (showIncorrectPick) {
                  classes +=
                    " border-border-danger-subtle bg-bg-danger-softer text-text-heading";
                } else {
                  classes +=
                    " border-border-default bg-bg-primary-soft text-text-body opacity-60";
                }
              } else if (isSelected) {
                classes += " border-border-brand bg-bg-brand-softer text-text-heading";
              } else {
                classes +=
                  " border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft";
              }

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => !submitted && setSelectedTf(value)}
                  disabled={submitted}
                  className={classes}
                >
                  {submitted && showCorrect ? (
                    <span className="inline-flex items-center gap-2">
                      <Check className="size-4 text-text-fg-success-strong" aria-hidden />
                      {label}
                    </span>
                  ) : submitted && showIncorrectPick ? (
                    <span className="inline-flex items-center gap-2">
                      <X className="size-4 text-text-fg-danger-strong" aria-hidden />
                      {label}
                    </span>
                  ) : (
                    label
                  )}
                </button>
              );
            })}
          </div>
        ) : null}

        {error ? <p className="text-sm text-text-fg-danger-strong">{error}</p> : null}

        {!submitted ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={(isSingleBestAnswerQuestion(question) ? !selectedMcId : selectedTf === null) || isPending}
              className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Submitting..." : "Submit answer"}
            </button>
          </div>
        ) : null}
      </div>

      {submitted && submission ? (
        <div
          className={[
            "border-t p-5",
            submission.isCorrect
              ? "border-border-success-subtle bg-bg-success-softer"
              : "border-border-danger-subtle bg-bg-danger-softer",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <span
              className={[
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                submission.isCorrect ? "bg-bg-success-soft text-text-fg-success-strong" : "bg-bg-danger-soft text-text-fg-danger-strong",
              ].join(" ")}
            >
              {submission.isCorrect ? <Check className="size-5" aria-hidden /> : <X className="size-5" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-text-heading">
                {submission.isCorrect ? "Correct" : "Incorrect"}
              </h3>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-body">{submission.explanation}</div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
            >
              Next question
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
