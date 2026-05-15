import { Check, X, AlertCircle } from "lucide-react";

import type { QuizAttemptResult } from "@/lib/quiz-bank/queries";
import { isMcSingleCorrectQuestion, isMultiSelectQuestion, isTrueFalseQuestion } from "@/lib/quiz-bank/types";

import { FlagButton } from "./FlagButton";
import { QuestionStimulusImage } from "./QuestionStimulusImage";

type Props = {
  entry: QuizAttemptResult["questions"][number];
  questionNumber: number;
  initialFlagged: boolean;
  onFlagToggle?: (nowFlagged: boolean) => void;
};

export function QuizResultQuestionCard({ entry, questionNumber, initialFlagged, onFlagToggle }: Props) {
  const { question, userAnswer, isCorrect } = entry;
  const wasAnswered = userAnswer !== null;

  const borderClass = wasAnswered
    ? isCorrect
      ? "border-border-success"
      : "border-border-danger"
    : "border-border-default";

  const userChoiceId =
    userAnswer?.type === "single_best_answer" || userAnswer?.type === "image_stimulus"
      ? userAnswer.selectedChoiceId
      : null;
  const userTf = userAnswer?.type === "true_false" ? userAnswer.value : null;
  const userMultiSet =
    userAnswer?.type === "multi_select" ? new Set(userAnswer.selectedChoiceIds) : new Set<string>();

  return (
    <article className={`rounded-base border bg-bg-primary-soft ${borderClass}`}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-secondary-soft text-xs font-bold text-text-muted">
            {questionNumber}
          </span>
          {question.category ? (
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {question.category.name}
            </span>
          ) : null}
          <span className="text-xs font-medium capitalize text-text-muted">{question.difficulty}</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge isCorrect={isCorrect} wasAnswered={wasAnswered} />
          <FlagButton
            key={`${question.id}-${initialFlagged}`}
            questionId={question.id}
            initialFlagged={initialFlagged}
            variant="icon"
            onToggle={onFlagToggle}
          />
        </div>
      </header>

      <div className="space-y-5 p-5">
        {question.vignette ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-body">{question.vignette}</div>
        ) : null}

        {question.questionType === "image_stimulus" ? (
          <QuestionStimulusImage
            src={question.imageUrl}
            alt={question.imageAttribution?.trim() ? question.imageAttribution : "Clinical image"}
          />
        ) : question.imageUrl ? (
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

        {isMcSingleCorrectQuestion(question) ? (
          <ol className="space-y-2">
            {question.choices.map((choice, i) => {
              const letter = String.fromCharCode(65 + i);
              const isUserChoice = wasAnswered && userChoiceId === choice.id;
              const isCorrectChoice = choice.isCorrect;
              /** Green "you earned it" styling only when the user submitted an answer (right or wrong). Unanswered: show correct key in neutral/info style so it does not read as a correct *attempt*. */
              const correctChoiceEarnedSuccess = isCorrectChoice && wasAnswered;
              const correctChoiceUnansweredReveal = isCorrectChoice && !wasAnswered;

              let classes = "flex items-start gap-3 rounded-base border px-4 py-3 text-sm";
              if (correctChoiceEarnedSuccess) {
                classes += " border-border-success bg-bg-success-softer";
              } else if (correctChoiceUnansweredReveal) {
                classes += " border-border-brand-subtle bg-bg-brand-softer";
              } else if (isUserChoice) {
                classes += " border-border-danger bg-bg-danger-softer";
              } else {
                classes += " border-border-default bg-bg-primary-soft";
              }

              return (
                <li key={choice.id} className={classes}>
                  <span
                    className={[
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      correctChoiceEarnedSuccess
                        ? "bg-bg-success text-text-on-brand"
                        : isUserChoice
                          ? "bg-bg-danger text-text-on-brand"
                          : "bg-bg-secondary-soft text-text-muted",
                    ].join(" ")}
                  >
                    {correctChoiceEarnedSuccess ? (
                      <Check className="size-3.5" aria-hidden />
                    ) : isUserChoice ? (
                      <X className="size-3.5" aria-hidden />
                    ) : (
                      letter
                    )}
                  </span>
                  <div className="flex-1 leading-relaxed text-text-heading">
                    {choice.text}
                    <span className="ml-2 inline-flex items-center gap-2 text-xs">
                      {isCorrectChoice ? (
                        <span
                          className={
                            correctChoiceUnansweredReveal
                              ? "font-medium text-text-fg-brand-strong"
                              : "font-medium text-text-fg-success-strong"
                          }
                        >
                          Correct answer
                        </span>
                      ) : null}
                      {isUserChoice && !isCorrectChoice ? (
                        <span className="font-medium text-text-fg-danger">Your answer</span>
                      ) : null}
                      {isUserChoice && isCorrectChoice ? (
                        <span className="font-medium text-text-fg-success-strong">Your answer</span>
                      ) : null}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}

        {isMultiSelectQuestion(question) ? (
          <ol className="space-y-2">
            {question.choices.map((choice, i) => {
              const letter = String.fromCharCode(65 + i);
              const isCorrectChoice = choice.isCorrect;
              const userPicked = wasAnswered && userMultiSet.has(choice.id);

              let classes = "flex items-start gap-3 rounded-base border px-4 py-3 text-sm";

              if (!wasAnswered) {
                if (isCorrectChoice) {
                  classes += " border-border-brand-subtle bg-bg-brand-softer";
                } else {
                  classes += " border-border-default bg-bg-primary-soft";
                }
              } else if (isCorrect === true) {
                if (isCorrectChoice) {
                  classes += " border-border-success bg-bg-success-softer";
                } else {
                  classes += " border-border-default bg-bg-primary-soft opacity-70";
                }
              } else {
                if (isCorrectChoice && userPicked) {
                  classes += " border-border-success bg-bg-success-softer";
                } else if (isCorrectChoice && !userPicked) {
                  classes += " border-border-brand-subtle bg-bg-brand-softer";
                } else if (!isCorrectChoice && userPicked) {
                  classes += " border-border-danger bg-bg-danger-softer";
                } else {
                  classes += " border-border-default bg-bg-primary-soft opacity-70";
                }
              }

              return (
                <li key={choice.id} className={classes}>
                  <span
                    className={[
                      "flex size-6 shrink-0 items-center justify-center rounded-sm border text-xs font-bold",
                      wasAnswered && isCorrect === true && isCorrectChoice
                        ? "border-border-success bg-bg-success text-text-on-brand"
                        : wasAnswered && isCorrectChoice && userPicked && isCorrect === false
                          ? "border-border-success bg-bg-success text-text-on-brand"
                          : wasAnswered && isCorrectChoice && !userPicked
                            ? "border-border-brand bg-bg-brand-softer text-text-fg-brand-strong"
                            : wasAnswered && !isCorrectChoice && userPicked
                              ? "border-border-danger bg-bg-danger text-text-on-brand"
                              : "border-border-default bg-bg-secondary-soft text-text-muted",
                    ].join(" ")}
                  >
                    {!wasAnswered && isCorrectChoice ? (
                      <span className="text-[10px] font-bold" aria-hidden>
                        ✓
                      </span>
                    ) : wasAnswered && isCorrectChoice && userPicked ? (
                      <Check className="size-3.5" aria-hidden />
                    ) : wasAnswered && isCorrectChoice && !userPicked ? (
                      <span className="text-[10px] font-bold" aria-hidden>
                        !
                      </span>
                    ) : wasAnswered && !isCorrectChoice && userPicked ? (
                      <X className="size-3.5" aria-hidden />
                    ) : (
                      letter
                    )}
                  </span>
                  <div className="flex-1 leading-relaxed text-text-heading">
                    {choice.text}
                    <span className="ml-2 inline-flex flex-wrap items-center gap-2 text-xs">
                      {!wasAnswered && isCorrectChoice ? (
                        <span className="font-medium text-text-fg-brand-strong">Correct answer</span>
                      ) : null}
                      {wasAnswered && isCorrectChoice && userPicked ? (
                        <span className="font-medium text-text-fg-success-strong">Your answer · correct</span>
                      ) : null}
                      {wasAnswered && isCorrectChoice && !userPicked ? (
                        <span className="font-medium text-text-fg-brand-strong">Correct (missed)</span>
                      ) : null}
                      {wasAnswered && !isCorrectChoice && userPicked ? (
                        <span className="font-medium text-text-fg-danger">Your answer · incorrect</span>
                      ) : null}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}

        {isTrueFalseQuestion(question) ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {([true, false] as const).map((value) => {
              const label = value ? "True" : "False";
              const isCorrectOption = value === question.correctAnswer;
              const isUserChoice = wasAnswered && userTf === value;
              const correctEarned = isCorrectOption && wasAnswered;
              const correctUnansweredReveal = isCorrectOption && !wasAnswered;

              let classes = "flex items-center justify-center gap-2 rounded-base border px-4 py-4 text-sm font-semibold";
              if (correctEarned) {
                classes += " border-border-success bg-bg-success-softer";
              } else if (correctUnansweredReveal) {
                classes += " border-border-brand-subtle bg-bg-brand-softer";
              } else if (isUserChoice) {
                classes += " border-border-danger bg-bg-danger-softer";
              } else {
                classes += " border-border-default bg-bg-primary-soft";
              }

              return (
                <div key={label} className={classes}>
                  <span
                    className={[
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      correctEarned
                        ? "bg-bg-success text-text-on-brand"
                        : isUserChoice
                          ? "bg-bg-danger text-text-on-brand"
                          : "bg-bg-secondary-soft text-text-muted",
                    ].join(" ")}
                  >
                    {correctEarned ? <Check className="size-3.5" aria-hidden /> : isUserChoice ? <X className="size-3.5" aria-hidden /> : null}
                  </span>
                  <span className="text-text-heading">{label}</span>
                  <span className="ml-auto flex flex-wrap items-center gap-2 text-xs">
                    {isCorrectOption ? (
                      <span
                        className={
                          correctUnansweredReveal
                            ? "font-medium text-text-fg-brand-strong"
                            : "font-medium text-text-fg-success-strong"
                        }
                      >
                        Correct answer
                      </span>
                    ) : null}
                    {isUserChoice && !isCorrectOption ? (
                      <span className="font-medium text-text-fg-danger">Your answer</span>
                    ) : null}
                    {isUserChoice && isCorrectOption ? (
                      <span className="font-medium text-text-fg-success-strong">Your answer</span>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="rounded-base border border-border-default bg-bg-secondary-soft p-4">
          <h3 className="text-sm font-bold text-text-heading">Explanation</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-body">{question.explanation}</p>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  isCorrect,
  wasAnswered,
}: {
  isCorrect: boolean | null;
  wasAnswered: boolean;
}) {
  if (!wasAnswered) {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-bg-secondary-soft px-2 py-0.5 text-xs font-medium text-text-muted">
        <AlertCircle className="size-3" aria-hidden />
        Not answered
      </span>
    );
  }
  if (isCorrect) {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-bg-success-softer px-2 py-0.5 text-xs font-medium text-text-fg-success-strong">
        <Check className="size-3" aria-hidden />
        Correct
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-bg-danger-softer px-2 py-0.5 text-xs font-medium text-text-fg-danger">
      <X className="size-3" aria-hidden />
      Incorrect
    </span>
  );
}
