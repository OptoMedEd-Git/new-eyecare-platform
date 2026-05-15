export type QuizDifficulty = "foundational" | "intermediate" | "advanced";

/** Matches DB enum `quiz_question_type`; extend when new types ship. */
export type QuizQuestionType = "single_best_answer" | "true_false" | "multi_select" | "image_stimulus";

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

/** Satellite: quiz_question_choices (single_best_answer, multi_select, image_stimulus). */
export type ChoiceListSatellite = {
  choices: QuizChoice[];
};

/** Satellite: quiz_question_choices for single_best_answer. */
export type SingleBestAnswerSatellite = ChoiceListSatellite;

/** Satellite: quiz_question_true_false for true_false. */
export type TrueFalseSatellite = {
  correctAnswer: boolean;
};

/** Fully loaded question for the app (discriminated union — add arms per new question_type). */
export type SingleBestAnswerQuestion = QuizQuestionBase & SingleBestAnswerSatellite & { questionType: "single_best_answer" };

export type MultiSelectQuestion = QuizQuestionBase & ChoiceListSatellite & { questionType: "multi_select" };

/** Same choice rules as single_best_answer; `image_url` on base is the required stimulus. */
export type ImageStimulusQuestion = QuizQuestionBase & ChoiceListSatellite & { questionType: "image_stimulus" };

export type TrueFalseQuestion = QuizQuestionBase & TrueFalseSatellite & { questionType: "true_false" };

export type QuizQuestion = SingleBestAnswerQuestion | MultiSelectQuestion | ImageStimulusQuestion | TrueFalseQuestion;

export function isSingleBestAnswerQuestion(q: QuizQuestion): q is SingleBestAnswerQuestion {
  return q.questionType === "single_best_answer";
}

export function isTrueFalseQuestion(q: QuizQuestion): q is TrueFalseQuestion {
  return q.questionType === "true_false";
}

export function isMultiSelectQuestion(q: QuizQuestion): q is MultiSelectQuestion {
  return q.questionType === "multi_select";
}

export function isImageStimulusQuestion(q: QuizQuestion): q is ImageStimulusQuestion {
  return q.questionType === "image_stimulus";
}

/** Single-best-answer style MC (one correct choice) — shared UI/scoring path for SBA + image stimulus. */
export function isMcSingleCorrectQuestion(q: QuizQuestion): q is SingleBestAnswerQuestion | ImageStimulusQuestion {
  return q.questionType === "single_best_answer" || q.questionType === "image_stimulus";
}

/** What the learner submitted, used by scoring and results (generalizes beyond choice id). */
export type SubmittedQuestionAnswer =
  | { type: "single_best_answer"; selectedChoiceId: string }
  | { type: "image_stimulus"; selectedChoiceId: string }
  | { type: "true_false"; value: boolean }
  | { type: "multi_select"; selectedChoiceIds: string[] };

/**
 * Result of evaluating a submission. `isCorrect` is the all-or-nothing pass used for quiz scoring today.
 * `scoreRatio` is 0..1 (today 0 or 1); future partial-credit modes may set fractional values and optional `partialCredit`.
 */
export type QuestionEvaluationResult = {
  isCorrect: boolean;
  scoreRatio: number;
  partialCredit?: { earned: number; max: number };
};

/** Stored in question_responses.answer_payload (jsonb). */
export type SingleBestAnswerPayload = {
  type: "single_best_answer";
  version?: number;
  selectedChoiceId: string;
  /** Reserved for future partial-credit scoring; omit for all-or-nothing today. */
  partialCredit?: { earned: number; max: number };
};

export type ImageStimulusPayload = {
  type: "image_stimulus";
  version?: number;
  selectedChoiceId: string;
  partialCredit?: { earned: number; max: number };
};

export type TrueFalsePayload = {
  type: "true_false";
  version?: number;
  answer: boolean;
};

export type MultiSelectPayload = {
  type: "multi_select";
  version?: number;
  selectedChoiceIds: string[];
  /** Reserved for future partial-credit scoring. */
  partialCredit?: { earned: number; max: number };
};

export type QuestionAnswerPayload = SingleBestAnswerPayload | ImageStimulusPayload | TrueFalsePayload | MultiSelectPayload;

export type QuestionResponse = {
  id: string;
  userId: string;
  questionId: string;
  /** Denormalized FK for single_best_answer and image_stimulus; null for true_false and multi_select. */
  choiceId: string | null;
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

/** One saved answer when resuming a quiz attempt (curated or user-generated). */
export type QuizAttemptSavedResponse =
  | { questionId: string; kind: "single_best_answer"; choiceId: string }
  | { questionId: string; kind: "image_stimulus"; choiceId: string }
  | { questionId: string; kind: "true_false"; value: boolean }
  | { questionId: string; kind: "multi_select"; selectedChoiceIds: string[] };
