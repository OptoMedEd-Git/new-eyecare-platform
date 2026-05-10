import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProgressBar } from "@/components/shared/ProgressBar";

type Props = {
  course: {
    id: string;
    title: string;
    category: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
  };
};

export function ContinueLearningCard({ course }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-base border border-border-default bg-bg-primary-soft p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-fg-brand-strong">{course.category}</span>
          <h3 className="text-base font-bold text-text-heading">{course.title}</h3>
        </div>
      </div>

      {course.completedLessons > 0 ? (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-text-body">
              {course.completedLessons} of {course.totalLessons} lessons
            </span>
            <span className="font-semibold text-text-heading">{course.progress}%</span>
          </div>
          <ProgressBar
            value={course.completedLessons}
            max={course.totalLessons}
            size="sm"
            ariaLabel={`${course.completedLessons} of ${course.totalLessons} lessons completed`}
          />
        </div>
      ) : null}

      <Link
        href={`/courses/${course.id}`}
        // SAMPLE: placeholder route — replace when course routes exist.
        className="inline-flex items-center gap-1 self-start text-sm font-medium text-text-fg-brand-strong hover:underline"
      >
        Continue learning
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

