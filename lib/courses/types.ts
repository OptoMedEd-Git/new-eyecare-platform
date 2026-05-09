export type CourseAudience = "student" | "resident" | "practicing" | "all";

export type Lesson = {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  description: string | null;
  /** TipTap JSON document */
  content: unknown;
  estimatedMinutes: number;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  learningObjectives: string[];
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: { id: string; name: string } | null;
  audience: CourseAudience | null;
  coverImageUrl: string | null;
  coverImageAttribution: string | null;
  status: "draft" | "published";
  authorId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  /** Sum of all lesson estimatedMinutes */
  totalDurationMinutes: number;
  learningObjectives: string[];
};
