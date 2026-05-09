import type { SampleCourse, SampleLesson } from "./sample-data";

export type CourseProgress = {
  completedCount: number;
  totalCount: number;
  percentComplete: number;
  /** First lesson not completed; null if all completed. */
  nextLesson: SampleLesson | null;
  hasStarted: boolean;
};

/** Serializable subset for client components (no nested lesson content). */
export type CourseProgressSummary = Omit<CourseProgress, "nextLesson">;

export function toProgressSummary(p: CourseProgress): CourseProgressSummary {
  return {
    completedCount: p.completedCount,
    totalCount: p.totalCount,
    percentComplete: p.percentComplete,
    hasStarted: p.hasStarted,
  };
}

export function computeCourseProgress(course: SampleCourse, completedLessonIds: string[]): CourseProgress {
  const completedSet = new Set(completedLessonIds);
  const totalCount = course.lessons.length;
  const completedCount = course.lessons.filter((l) => completedSet.has(l.id)).length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const nextLesson = course.lessons.find((l) => !completedSet.has(l.id)) ?? null;

  return {
    completedCount,
    totalCount,
    percentComplete,
    nextLesson,
    hasStarted: completedCount > 0,
  };
}

export function isLessonCompleted(lessonId: string, completedLessonIds: string[]): boolean {
  return completedLessonIds.includes(lessonId);
}
