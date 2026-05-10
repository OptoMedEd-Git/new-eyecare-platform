export type QuizDifficulty = "foundational" | "intermediate" | "advanced";
export type QuizQuestionType = "single_best_answer";
export type QuestionAudience = "student" | "resident" | "practicing" | "all";
export type QuestionStatus = "draft" | "published";

export type QuizChoice = {
  id: string;
  questionId: string;
  position: number;
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: string;
  vignette: string | null;
  questionText: string;
  explanation: string;
  imageUrl: string | null;
  imageAttribution: string | null;
  questionType: QuizQuestionType;
  category: { id: string; name: string } | null;
  audience: QuestionAudience | null;
  difficulty: QuizDifficulty;
  status: QuestionStatus;
  authorId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  choices: QuizChoice[];
};

export type QuestionResponse = {
  id: string;
  userId: string;
  questionId: string;
  choiceId: string;
  isCorrect: boolean;
  answeredAt: string;
};

export type PracticeStats = {
  totalAnswered: number;
  totalCorrect: number;
  totalUniqueQuestionsAnswered: number;
};

export type PracticeFilters = {
  categoryIds: string[];
  audiences: QuestionAudience[];
  difficulties: QuizDifficulty[];
};

export type PracticeQuestionResult = {
  question: QuizQuestion;
  previouslyAnswered: boolean;
  previousResult?: { wasCorrect: boolean };
};

export type QuizKind = "curated" | "user_generated";

export type Quiz = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  kind: QuizKind;
  category: { id: string; name: string } | null;
  audience: QuestionAudience | null;
  difficulty: QuizDifficulty | null;
  timeLimitMinutes: number | null;
  timePerQuestionSeconds: number | null;
  isFeatured: boolean;
  status: QuestionStatus;
  authorId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QuizItem = {
  id: string;
  quizId: string;
  questionId: string;
  position: number;
  question?: QuizQuestion;
};

export type QuizWithItems = Quiz & {
  items: QuizItem[];
  questionCount: number;
};

export type QuizAttemptStatus = "in_progress" | "submitted" | "abandoned";

export type QuizAttempt = {
  id: string;
  userId: string;
  quizId: string;
  status: QuizAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  abandonedAt: string | null;
  scoreCorrect: number | null;
  scoreTotal: number | null;
  timeLimitMinutes: number | null;
  createdAt: string;
  updatedAt: string;
};

export type QuizAttemptResponse = {
  questionId: string;
  choiceId: string;
};

export type QuizWithQuestions = Quiz & {
  questions: QuizQuestion[];
};

export type QuizListing = Quiz & {
  questionCount: number;
};

/** Practice-mode accuracy aggregated by question category (quiz bank dashboard). */
export type QuizBankCategoryAccuracyRow = {
  category: string;
  percentage: number;
  total: number;
  correct: number;
};

/** One calendar day of practice accuracy (UTC date key from `answered_at`). */
export type QuizBankDailyAccuracyRow = {
  dateKey: string;
  label: string;
  accuracyPct: number;
};

/** Server payload for `/quiz-bank` dashboard stats and charts. */
export type QuizBankDashboardData = {
  stats: PracticeStats;
  accuracyPct: number;
  unansweredCount: number;
  categoryAccuracy: QuizBankCategoryAccuracyRow[];
  accuracyOverTime: QuizBankDailyAccuracyRow[];
};
