/**
 * SAMPLE / PLACEHOLDER DATA for the dashboard.
 *
 * All data here is mock content for design/layout purposes. When real data
 * sources exist (user progress tracking, recommendation engine, etc.),
 * replace these exports with real query functions.
 *
 * NOTHING in this file should reach production users without being
 * replaced or wired to real data.
 */

export type SampleCourse = {
  id: string;
  title: string;
  category: string;
  progress: number; // 0-100
  totalLessons: number;
  completedLessons: number;
};

export type SampleRecommendation = {
  id: string;
  title: string;
  category: string;
  type: "Course" | "Pathway" | "Case" | "Quiz";
  estimatedMinutes: number;
};

export type DailyActivity = {
  day: string; // "Mon", "Tue", etc.
  questions: number;
};

export const SAMPLE_STATS = {
  pathwaysInProgress: { value: 3, total: 7, trendDelta: null as number | null },
  questionsAnswered: { value: 428, weeklyDelta: 24 },
  casesReviewed: { value: 67, weeklyDelta: 5 },
} as const;

export const SAMPLE_CONTINUE_LEARNING: SampleCourse[] = [
  {
    id: "c1",
    title: "Diabetic retinopathy: screening and management",
    category: "Posterior segment",
    progress: 65,
    totalLessons: 12,
    completedLessons: 8,
  },
  {
    id: "c2",
    title: "Anterior segment exam fundamentals",
    category: "Anterior segment",
    progress: 40,
    totalLessons: 10,
    completedLessons: 4,
  },
  {
    id: "c3",
    title: "Pediatric vision screening protocols",
    category: "Pediatric optometry",
    progress: 80,
    totalLessons: 8,
    completedLessons: 6,
  },
];

export const SAMPLE_RECOMMENDATIONS: SampleRecommendation[] = [
  {
    id: "r1",
    title: "Reading OCT scans systematically",
    category: "Diagnostic imaging",
    type: "Course",
    estimatedMinutes: 35,
  },
  {
    id: "r2",
    title: "Acute red eye: differential diagnosis",
    category: "Anterior segment",
    type: "Case",
    estimatedMinutes: 20,
  },
  {
    id: "r3",
    title: "Glaucoma medication interactions",
    category: "Glaucoma",
    type: "Quiz",
    estimatedMinutes: 15,
  },
];

// 7 days of mock activity data, ordered Mon → Sun
export const SAMPLE_WEEKLY_ACTIVITY: DailyActivity[] = [
  { day: "Mon", questions: 12 },
  { day: "Tue", questions: 18 },
  { day: "Wed", questions: 8 },
  { day: "Thu", questions: 24 },
  { day: "Fri", questions: 15 },
  { day: "Sat", questions: 6 },
  { day: "Sun", questions: 9 },
];

