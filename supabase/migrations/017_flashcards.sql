-- 017_flashcards.sql
-- Flashcards: front/back text, optional blog category, reviews log (foundation for future SR).
-- Reuses quiz_difficulty from 011_quiz_bank.sql. Categories reference blog_categories (shared taxonomy).

CREATE TYPE flashcard_rating AS ENUM ('again', 'hard', 'good');

CREATE TABLE flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  front text NOT NULL,
  back text NOT NULL,
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  target_audience text CHECK (target_audience IN ('student', 'resident', 'practicing', 'all')),
  difficulty quiz_difficulty NOT NULL DEFAULT 'intermediate',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX flashcards_status_idx ON flashcards(status);
CREATE INDEX flashcards_category_idx ON flashcards(category_id);
CREATE INDEX flashcards_published_idx ON flashcards(published_at DESC) WHERE status = 'published';

CREATE TABLE flashcard_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  flashcard_id uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  rating flashcard_rating NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX flashcard_reviews_user_idx ON flashcard_reviews(user_id);
CREATE INDEX flashcard_reviews_user_card_idx ON flashcard_reviews(user_id, flashcard_id);
CREATE INDEX flashcard_reviews_reviewed_at_idx ON flashcard_reviews(reviewed_at DESC);

DROP TRIGGER IF EXISTS flashcards_updated_at ON flashcards;
CREATE TRIGGER flashcards_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published flashcards" ON flashcards
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can read their own draft flashcards" ON flashcards
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage their own flashcards" ON flashcards
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Users can read their own reviews" ON flashcard_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews" ON flashcard_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE flashcards IS 'Active-recall flashcards. Front+back text, optional category. Future: deck membership.';
COMMENT ON TABLE flashcard_reviews IS 'Append-only self-ratings per encounter; foundation for spaced repetition.';
