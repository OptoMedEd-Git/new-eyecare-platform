export type QuizDifficulty = "foundational" | "intermediate" | "advanced";

/** Matches DB enum `quiz_question_type`; extend when new types ship. */
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

/** Fields shared by every question row (base table quiz_questions). */
export type QuizQuestionBase = {
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
};

/** Satellite: quiz_question_choices for single_best_answer. */
export type SingleBestAnswerSatellite = {
  choices: QuizChoice[];
};

/** Fully loaded question for the app (discriminated union — add arms per new question_type). */
export type SingleBestAnswerQuestion = QuizQuestionBase & SingleBestAnswerSatellite;

export type QuizQuestion = SingleBestAnswerQuestion;

/** Stored in question_responses.answer_payload (jsonb). */
export type SingleBestAnswerPayload = {
  type: "single_best_answer";
  version?: number;
  selectedChoiceId: string;
  /** Reserved for future partial-credit scoring; omit for all-or-nothing today. */
  partialCredit?: { earned: number; max: number };
};

export type QuestionAnswerPayload = SingleBestAnswerPayload;

export type QuestionResponse = {
  id: string;
  userId: string;
  questionId: string;
  /** Denormalized FK for single_best_answer; future types may deprecate. */
  choiceId: string;
  answerPayload: QuestionAnswerPayload;
  isCorrect: boolean;
  answeredAt: string;
  quizAttemptId?: string | null;
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
  isFlagged: boolean;
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

/** One submitted quiz attempt for review lists (curated + user-generated unified). */
export type PastQuizAttemptSummary = {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  quizKind: QuizKind;
  quizSlug: string | null;
  scoreCorrect: number;
  scoreTotal: number;
  questionCount: number;
  submittedAt: string;
};

/** Mutually exclusive buckets over published bank questions (see getUserQuestionAnswerBreakdown). */
export type QuizBankAnswerBreakdown = {
  totalPublished: number;
  correctCount: number;
  incorrectCount: number;
  flaggedCount: number;
  notAttemptedCount: number;
  /** correct / (correct + incorrect); null when denominator is zero. */
  accuracyPercent: number | null;
};

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
