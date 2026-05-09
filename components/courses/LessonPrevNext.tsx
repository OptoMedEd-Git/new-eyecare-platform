"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, List } from "lucide-react";

import type { SampleLesson } from "@/lib/courses/sample-data";

type Props = {
  courseSlug: string;
  previous: SampleLesson | null;
  next: SampleLesson | null;
  onOpenDrawer: () => void;
};

export function LessonPrevNext({ courseSlug, previous, next, onOpenDrawer }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 justify-start">
        {previous ? (
          <Link
            href={`/courses/${courseSlug}/${previous.slug}`}
            className="inline-flex items-center gap-1.5 rounded-base border border-border-default px-3 py-1.5 text-sm text-text-body hover:bg-bg-secondary-soft"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Previous
          </Link>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenDrawer}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-base border border-border-default px-3 py-1.5 text-sm text-text-body hover:bg-bg-secondary-soft xl:hidden"
        aria-label="Open lesson navigator"
      >
        <List className="size-4" aria-hidden />
        Lessons
      </button>

      <div className="flex min-w-0 flex-1 justify-end">
        {next ? (
          <Link
            href={`/courses/${courseSlug}/${next.slug}`}
            className="inline-flex items-center gap-1.5 rounded-base border border-border-default px-3 py-1.5 text-sm text-text-body hover:bg-bg-secondary-soft"
          >
            Next
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
