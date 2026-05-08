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
  description: string;
  category: string;
  type: "Pathway" | "Course" | "Quiz" | "Case";
  estimatedMinutes: number;
  seeMoreHref: string;
};

export type SampleActivity = {
  id: string;
  title: string;
  type: "Course" | "Quiz" | "Case" | "Pathway" | "Flashcards";
  completedAt: string; // ISO date string, e.g. "2026-05-06"
  detail: string; // brief secondary line (e.g., "Score: 92%", "Lesson 4 of 8")
  reviewHref: string; // placeholder route for "Review" link
};

export type CategoryPerformance = {
  category: string;
  percentage: number; // 0-100, percent correct
};

export type DailyActivity = {
  day: string; // "Mon", "Tue", etc.
  questions: number;
};

// Skill mastery — category-level percentages
export const SAMPLE_SKILL_MASTERY = [
  { name: "Anterior Segment", value: 65 },
  { name: "Posterior Segment", value: 40 },
  { name: "Glaucoma", value: 80 },
  { name: "Neuro-ophthalmology", value: 25 },
  { name: "Pediatric Optometry", value: 50 },
] as const;

// Monthly activity — 4 weeks, segmented by activity type
export const SAMPLE_MONTHLY_PROGRESS = [
  { week: "Week 1", questions: 42, cases: 8, flashcards: 35 },
  { week: "Week 2", questions: 58, cases: 12, flashcards: 28 },
  { week: "Week 3", questions: 35, cases: 6, flashcards: 42 },
  { week: "Week 4", questions: 67, cases: 14, flashcards: 31 },
] as const;

// Achievements / badges (PLACEHOLDER for future gamification system)
export type SampleBadge = {
  id: string;
  name: string;
  description: string;
  /** Lucide icon name as string — component lookup happens in AchievementsCard */
  icon: "Trophy" | "Award" | "Medal" | "Target" | "Flame" | "Zap" | "Star" | "Sparkles";
  unlocked: boolean;
};

export const SAMPLE_BADGES: SampleBadge[] = [
  {
    id: "b1",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "Trophy",
    unlocked: true,
  },
  {
    id: "b2",
    name: "Quiz Master",
    description: "Answer 100 questions correctly",
    icon: "Target",
    unlocked: true,
  },
  {
    id: "b3",
    name: "Case Detective",
    description: "Review 25 clinical cases",
    icon: "Medal",
    unlocked: true,
  },
  {
    id: "b4",
    name: "On Fire",
    description: "Maintain a 7-day learning streak",
    icon: "Flame",
    unlocked: false,
  },
  {
    id: "b5",
    name: "Pathway Pioneer",
    description: "Complete an entire learning pathway",
    icon: "Award",
    unlocked: false,
  },
  {
    id: "b6",
    name: "Speed Learner",
    description: "Complete 5 modules in one week",
    icon: "Zap",
    unlocked: false,
  },
];

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
    title: "Glaucoma management mastery",
    description: "Build a full clinical workflow for diagnosing and managing primary open-angle glaucoma.",
    category: "Glaucoma",
    type: "Pathway",
    estimatedMinutes: 120,
    seeMoreHref: "/pathways",
  },
  {
    id: "r2",
    title: "Reading OCT scans systematically",
    description: "Learn a structured framework for interpreting OCT imaging across common pathologies.",
    category: "Diagnostic imaging",
    type: "Course",
    estimatedMinutes: 35,
    seeMoreHref: "/courses",
  },
  {
    id: "r3",
    title: "Glaucoma medication interactions",
    description: "Test your knowledge of common glaucoma drugs and their systemic considerations.",
    category: "Glaucoma",
    type: "Quiz",
    estimatedMinutes: 15,
    seeMoreHref: "/quiz-bank",
  },
  {
    id: "r4",
    title: "Acute red eye: differential diagnosis",
    description: "Work through a case-based approach to narrowing down acute anterior segment causes.",
    category: "Anterior segment",
    type: "Case",
    estimatedMinutes: 20,
    seeMoreHref: "/cases",
  },
];

export const SAMPLE_RECENT_ACTIVITY: SampleActivity[] = [
  {
    id: "a1",
    title: "Diabetic retinopathy staging",
    type: "Quiz",
    completedAt: "2026-05-06",
    detail: "Score: 92%",
    reviewHref: "#",
  },
  {
    id: "a2",
    title: "Acute angle closure: emergency triage",
    type: "Case",
    completedAt: "2026-05-05",
    detail: "12 minutes",
    reviewHref: "#",
  },
  {
    id: "a3",
    title: "OCT artifact recognition",
    type: "Course",
    completedAt: "2026-05-04",
    detail: "Lesson 4 of 8",
    reviewHref: "#",
  },
  {
    id: "a4",
    title: "Anterior segment anatomy review",
    type: "Flashcards",
    completedAt: "2026-05-03",
    detail: "24 cards reviewed",
    reviewHref: "#",
  },
  {
    id: "a5",
    title: "Pediatric vision screening fundamentals",
    type: "Course",
    completedAt: "2026-05-02",
    detail: "Lesson 3 of 8",
    reviewHref: "#",
  },
];

// Sample category performance — sorted by percentage descending for visual clarity in the chart
export const SAMPLE_CATEGORY_PERFORMANCE: CategoryPerformance[] = [
  { category: "Glaucoma", percentage: 92 },
  { category: "Anterior Segment", percentage: 87 },
  { category: "Diagnostic Imaging", percentage: 81 },
  { category: "Posterior Segment", percentage: 76 },
  { category: "Pediatric Optometry", percentage: 68 },
  { category: "Neuro-ophthalmology", percentage: 54 },
  { category: "Contact Lenses", percentage: 49 },
  { category: "Low Vision", percentage: 42 },
  { category: "Binocular Vision", percentage: 38 },
  { category: "Ocular Pharmacology", percentage: 31 },
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

