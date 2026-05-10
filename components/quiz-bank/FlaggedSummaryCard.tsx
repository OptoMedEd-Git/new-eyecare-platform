import type { RecentFlaggedItem } from "@/lib/quiz-bank/queries";
import { ArrowRight, Flag } from "lucide-react";
import Link from "next/link";

type Props = {
  totalCount: number;
  recent: RecentFlaggedItem[];
};

export function FlaggedSummaryCard({ totalCount, recent }: Props) {
  if (totalCount === 0) {
    return (
      <article className="flex flex-col rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-6">
        <h3 className="inline-flex items-center gap-2 text-base font-bold text-text-heading">
          <Flag className="size-5 text-text-muted" aria-hidden />
          Flagged questions
        </h3>
        <p className="mt-2 flex-1 text-sm text-text-body">
          Use the flag icon on any question to save it for later review. Flagged questions appear here for easy access.
        </p>
      </article>
    );
  }

  return (
    <article className="flex flex-col rounded-base border border-border-default bg-bg-primary-soft p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="inline-flex items-center gap-2 text-base font-bold text-text-heading">
            <Flag className="size-5 text-text-fg-brand-strong" fill="currentColor" aria-hidden />
            Flagged questions
          </h3>
          <p className="mt-1 text-sm text-text-body">
            {totalCount} {totalCount === 1 ? "question" : "questions"} saved for review
          </p>
        </div>
      </header>

      {recent.length > 0 ? (
        <ul className="mt-4 flex-1 space-y-3">
          {recent.map((item) => (
            <li key={item.questionId} className="border-t border-border-default pt-3">
              {item.category ? (
                <p className="text-xs font-medium text-text-fg-brand-strong">{item.category.name}</p>
              ) : null}
              <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-text-heading">{item.questionText}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        href="/quiz-bank/flagged"
        className="mt-5 inline-flex items-center gap-1.5 self-start rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
      >
        Review all flagged
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}
