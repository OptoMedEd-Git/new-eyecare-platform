"use client";

import type { FlaggedQuestionEntry } from "@/lib/quiz-bank/queries";
import { Calendar, Flag } from "lucide-react";
import { useState } from "react";

import { FlagButton } from "./FlagButton";

type Props = { entries: FlaggedQuestionEntry[] };

export function FlaggedQuestionsList({ entries: initialEntries }: Props) {
  const [entries, setEntries] = useState(initialEntries);

  function handleFlagToggle(questionId: string, nowFlagged: boolean) {
    if (!nowFlagged) {
      setEntries((prev) => prev.filter((e) => e.question.id !== questionId));
    }
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
        <Flag className="mx-auto size-8 text-text-muted" aria-hidden />
        <p className="mt-3 text-base font-medium text-text-heading">No flagged questions yet</p>
        <p className="mt-1 text-sm text-text-body">
          When practicing or reviewing quiz results, use the flag icon to save tough questions here for later review.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.question.id}>
          <FlaggedQuestionRow entry={entry} onFlagToggle={handleFlagToggle} />
        </li>
      ))}
    </ul>
  );
}

function FlaggedQuestionRow({
  entry,
  onFlagToggle,
}: {
  entry: FlaggedQuestionEntry;
  onFlagToggle: (questionId: string, nowFlagged: boolean) => void;
}) {
  const { question, flaggedAt, note } = entry;

  return (
    <article className="rounded-base border border-border-default bg-bg-primary-soft p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
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
              <span className="text-xs font-medium capitalize text-text-muted">
                {question.audience === "all" ? "All clinicians" : question.audience}
              </span>
            </>
          ) : null}
        </div>

        <FlagButton
          questionId={question.id}
          initialFlagged={true}
          variant="icon"
          onToggle={(nowFlagged) => onFlagToggle(question.id, nowFlagged)}
        />
      </header>

      <div className="mt-3">
        {question.vignette ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-text-body">{question.vignette}</p>
        ) : null}
        <p className="mt-2 text-base font-medium leading-relaxed text-text-heading">{question.questionText}</p>
      </div>

      <footer className="mt-4 flex items-center gap-3 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3" aria-hidden />
          Flagged {new Date(flaggedAt).toLocaleDateString()}
        </span>
        {note ? (
          <>
            <span aria-hidden>·</span>
            <span className="italic">&ldquo;{note}&rdquo;</span>
          </>
        ) : null}
      </footer>
    </article>
  );
}
