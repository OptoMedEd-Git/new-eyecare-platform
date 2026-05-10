"use client";

import type { QuizQuestion } from "@/lib/quiz-bank/types";

import { FlagButton } from "./FlagButton";

type Props = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedChoiceId: string | null;
  onSelectChoice: (choiceId: string) => void;
  locked: boolean;
  initialFlagged: boolean;
  onFlagToggle?: (nowFlagged: boolean) => void;
};

export function QuizQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedChoiceId,
  onSelectChoice,
  locked,
  initialFlagged,
  onFlagToggle,
}: Props) {
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

        <ol className="space-y-2">
          {question.choices.map((choice, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = selectedChoiceId === choice.id;

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
                  onClick={() => !locked && onSelectChoice(choice.id)}
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
      </div>
    </article>
  );
}
