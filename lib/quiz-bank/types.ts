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
