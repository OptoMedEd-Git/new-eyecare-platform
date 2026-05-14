export type FlashcardAudience = "student" | "resident" | "practicing" | "all";
export type FlashcardDifficulty = "foundational" | "intermediate" | "advanced";
export type FlashcardStatus = "draft" | "published";
export type FlashcardRating = "again" | "hard" | "good";

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  imageUrl: string | null;
  imageAttribution: string | null;
  category: { id: string; name: string } | null;
  audience: FlashcardAudience | null;
  difficulty: FlashcardDifficulty;
  status: FlashcardStatus;
  authorId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FlashcardReview = {
  id: string;
  userId: string;
  flashcardId: string;
  rating: FlashcardRating;
  reviewedAt: string;
};

export type ReviewFilters = {
  categoryIds: string[];
  audiences: FlashcardAudience[];
  difficulties: FlashcardDifficulty[];
};

export type FlashcardReviewStats = {
  totalReviews: number;
  uniqueCardsReviewed: number;
  totalCardsPublished: number;
  lastRatingDistribution: {
    again: number;
    hard: number;
    good: number;
  };
};

/** Curated deck publish state (CMS + public listing). */
export type FlashcardDeckStatus = "draft" | "published";

export type DeckListing = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: { id: string; name: string } | null;
  audience: FlashcardAudience | null;
  difficulty: FlashcardDifficulty | null;
  isFeatured: boolean;
  status: FlashcardDeckStatus;
  authorId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
};

export type DeckWithCards = DeckListing & {
  cards: Flashcard[];
};
