import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

      {/* SAMPLE: progress bar (placeholder for real progress tracking). */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-text-body">
            {course.completedLessons} of {course.totalLessons} lessons
          </span>
          <span className="font-semibold text-text-heading">{course.progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-bg-secondary-medium">
          <div
            className="h-full rounded-full bg-bg-brand transition-all"
            style={{ width: `${course.progress}%` }}
            role="progressbar"
            aria-valuenow={course.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

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

