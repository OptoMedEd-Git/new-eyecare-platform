"use client";

import {
  isMultiSelectQuestion,
  isSingleBestAnswerQuestion,
  isTrueFalseQuestion,
  type QuizQuestion,
  type SubmittedQuestionAnswer,
} from "@/lib/quiz-bank/types";

import { FlagButton } from "./FlagButton";

type Props = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: SubmittedQuestionAnswer | null;
  onSelectAnswer: (answer: SubmittedQuestionAnswer) => void;
  locked: boolean;
  initialFlagged: boolean;
  onFlagToggle?: (nowFlagged: boolean) => void;
};

export function QuizQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  locked,
  initialFlagged,
  onFlagToggle,
}: Props) {
  const multiSelected =
    selectedAnswer?.type === "multi_select" ? new Set(selectedAnswer.selectedChoiceIds) : new Set<string>();

  function toggleMulti(choiceId: string) {
    if (locked) return;
    const next = new Set(multiSelected);
    if (next.has(choiceId)) next.delete(choiceId);
    else next.add(choiceId);
    onSelectAnswer({ type: "multi_select", selectedChoiceIds: [...next] });
  }

  return (
    <article className="rounded-base border border-border-default bg-bg-primary-soft">
      <header className="border-b border-border-default p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-text-muted">
            Question {questionNumber} of {totalQuestions}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
              {question.category ? (
                <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 font-medium text-text-fg-brand-strong">
                  {question.category.name}
                </span>
              ) : null}
              <span className="capitalize">{question.difficulty}</span>
            </div>
            <FlagButton
              questionId={question.id}
              initialFlagged={initialFlagged}
              variant="icon"
              onToggle={onFlagToggle}
            />
          </div>
        </div>
      </header>

      <div className="space-y-5 p-5">
        {question.vignette ? (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-text-body">{question.vignette}</div>
        ) : null}

        {question.imageUrl ? (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote URLs may not match next/image patterns */}
            <img
              src={question.imageUrl}
              alt=""
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
              const isSelected =
                selectedAnswer?.type === "single_best_answer" && selectedAnswer.selectedChoiceId === choice.id;

              let classes =
                "flex w-full items-start gap-3 rounded-base border px-4 py-3 text-left text-sm transition-colors";
              if (isSelected) {
                classes += " border-border-brand bg-bg-brand-softer text-text-heading";
              } else {
                classes += " border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft";
              }
              if (locked) {
                classes += " cursor-not-allowed";
              }

              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    onClick={() =>
                      !locked && onSelectAnswer({ type: "single_best_answer", selectedChoiceId: choice.id })
                    }
                    disabled={locked}
                    className={classes}
                  >
                    <span
                      className={[
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isSelected ? "bg-bg-brand text-text-on-brand" : "bg-bg-secondary-soft text-text-muted",
                      ].join(" ")}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 leading-relaxed">{choice.text}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : null}

        {isMultiSelectQuestion(question) ? (
          <ol className="space-y-2">
            {question.choices.map((choice, i) => {
              const letter = String.fromCharCode(65 + i);
              const isOn = multiSelected.has(choice.id);

              let classes =
                "flex w-full items-start gap-3 rounded-base border px-4 py-3 text-left text-sm transition-colors";
              if (isOn) {
                classes += " border-border-brand bg-bg-brand-softer text-text-heading";
              } else {
                classes += " border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft";
              }
              if (locked) {
                classes += " cursor-not-allowed";
              }

              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    onClick={() => toggleMulti(choice.id)}
                    disabled={locked}
                    className={classes}
                  >
                    <span
                      className={[
                        "flex size-6 shrink-0 items-center justify-center rounded-sm border text-xs font-bold",
                        isOn ? "border-border-brand bg-bg-brand text-text-on-brand" : "border-border-default bg-bg-secondary-soft text-text-muted",
                      ].join(" ")}
                      aria-hidden
                    >
                      {letter}
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
              const isSelected = selectedAnswer?.type === "true_false" && selectedAnswer.value === value;

              let classes =
                "flex w-full items-center justify-center rounded-base border px-4 py-4 text-sm font-semibold transition-colors";
              if (isSelected) {
                classes += " border-border-brand bg-bg-brand-softer text-text-heading";
              } else {
                classes += " border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft";
              }
              if (locked) {
                classes += " cursor-not-allowed";
              }

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => !locked && onSelectAnswer({ type: "true_false", value })}
                  disabled={locked}
                  className={classes}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
}
