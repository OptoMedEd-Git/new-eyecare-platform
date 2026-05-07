import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SampleRecommendation } from "@/lib/dashboard/sample-data";

type Props = {
  item: SampleRecommendation;
};

const TYPE_PLURAL = {
  Pathway: "pathways",
  Course: "courses",
  Quiz: "quizzes",
  Case: "cases",
} as const;

export function RecommendedItem({ item }: Props) {
  return (
    <article className="rounded-base border border-border-default bg-bg-primary-soft p-4">
      <div className="text-xs font-medium text-text-muted">
        {item.type} · {item.estimatedMinutes} min
      </div>

      <h3 className="mt-2 text-base font-bold leading-tight tracking-tight text-text-heading">
        <Link href="#" className="transition-colors hover:text-text-fg-brand-strong">
          {item.title}
        </Link>
      </h3>

      <p className="mt-1.5 text-sm leading-snug text-text-body">{item.description}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <Link
          href={`#category-${item.category.toLowerCase().replace(/\s+/g, "-")}`}
          className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong transition-colors hover:bg-bg-brand-soft"
        >
          {item.category}
        </Link>

        <Link
          href={item.seeMoreHref}
          className="inline-flex items-center gap-1 text-xs font-medium text-text-fg-brand-strong hover:underline"
        >
          See more {TYPE_PLURAL[item.type]}
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

