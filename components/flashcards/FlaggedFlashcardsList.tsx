"use client";

import { useState } from "react";
import { Calendar, Flag } from "lucide-react";

import { flagFlashcard, unflagFlashcard } from "@/app/(app)/flashcards/flag-actions";
import { FlagButton } from "@/components/shared/FlagButton";
import type { FlaggedFlashcardEntry } from "@/lib/flashcards/queries";

type Props = { entries: FlaggedFlashcardEntry[] };

export function FlaggedFlashcardsList({ entries: initialEntries }: Props) {
  const [entries, setEntries] = useState(initialEntries);

  function handleFlagToggle(flashcardId: string, nowFlagged: boolean) {
    if (!nowFlagged) {
      setEntries((prev) => prev.filter((e) => e.flashcard.id !== flashcardId));
    }
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
        <Flag className="mx-auto size-8 text-text-muted" aria-hidden />
        <p className="mt-3 text-base font-medium text-text-heading">No flagged flashcards yet</p>
        <p className="mt-1 text-sm text-text-body">
          During a review session, use the flag icon on any card to save it here for later review.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.flashcard.id}>
          <FlaggedFlashcardRow entry={entry} onFlagToggle={handleFlagToggle} />
        </li>
      ))}
    </ul>
  );
}

function FlaggedFlashcardRow({
  entry,
  onFlagToggle,
}: {
  entry: FlaggedFlashcardEntry;
  onFlagToggle: (flashcardId: string, nowFlagged: boolean) => void;
}) {
  const { flashcard, flaggedAt, note } = entry;

  return (
    <article className="rounded-base border border-border-default bg-bg-primary-soft p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {flashcard.category ? (
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {flashcard.category.name}
            </span>
          ) : null}
          <span className="text-xs font-medium capitalize text-text-muted">{flashcard.difficulty}</span>
          {flashcard.audience ? (
            <>
              <span className="text-text-muted" aria-hidden>
                ·
              </span>
              <span className="text-xs font-medium capitalize text-text-muted">
                {flashcard.audience === "all" ? "All clinicians" : flashcard.audience}
              </span>
            </>
          ) : null}
        </div>

        <FlagButton
          initialFlagged
          variant="icon"
          onToggle={(nowFlagged) => onFlagToggle(flashcard.id, nowFlagged)}
          flag={() => flagFlashcard(flashcard.id).then((r) => (r.success ? { success: true } : { success: false, error: r.error }))}
          unflag={() => unflagFlashcard(flashcard.id).then((r) => (r.success ? { success: true } : { success: false, error: r.error }))}
        />
      </header>

      <div className="mt-3">
        <p className="text-base font-medium leading-relaxed text-text-heading whitespace-pre-wrap">{flashcard.front}</p>
      </div>

      <footer className="mt-4 flex flex-wrap items-center gap-3 text-xs text-text-muted">
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
