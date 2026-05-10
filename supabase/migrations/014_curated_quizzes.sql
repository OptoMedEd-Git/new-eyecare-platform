-- 014_curated_quizzes.sql
-- Pre-made (curated) quizzes: collections of questions assembled by admins.
-- Schema also accommodates user-generated quizzes (Session D) via kind.

CREATE TYPE quiz_kind AS ENUM ('curated', 'user_generated');

CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text NOT NULL,
  description text,
  kind quiz_kind NOT NULL DEFAULT 'curated',
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  target_audience text CHECK (target_audience IN ('student', 'resident', 'practicing', 'all')),
  difficulty quiz_difficulty,
  time_limit_minutes integer CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),
  time_per_question_seconds integer CHECK (time_per_question_seconds IS NULL OR time_per_question_seconds > 0),
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quizzes_slug_required_for_curated CHECK (
    (kind = 'curated' AND slug IS NOT NULL)
    OR (kind = 'user_generated' AND slug IS NULL)
  )
);

CREATE INDEX quizzes_slug_idx ON quizzes(slug) WHERE slug IS NOT NULL;
CREATE INDEX quizzes_status_idx ON quizzes(status);
CREATE INDEX quizzes_kind_idx ON quizzes(kind);
CREATE INDEX quizzes_published_idx ON quizzes(published_at DESC) WHERE status = 'published';
CREATE INDEX quizzes_featured_idx ON quizzes(is_featured) WHERE is_featured = true AND status = 'published';

CREATE TABLE quiz_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quiz_id, question_id),
  UNIQUE (quiz_id, position)
);

CREATE INDEX quiz_items_quiz_idx ON quiz_items(quiz_id, position);

DROP TRIGGER IF EXISTS quizzes_updated_at ON quizzes;
CREATE TRIGGER quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published curated quizzes" ON quizzes
  FOR SELECT USING (status = 'published' AND kind = 'curated');

CREATE POLICY "Authors can read their own draft quizzes" ON quizzes
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage their own quizzes" ON quizzes
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Users can read their own user_generated quizzes" ON quizzes
  FOR SELECT USING (kind = 'user_generated' AND auth.uid() = author_id);

CREATE POLICY "Anyone can read items of published quizzes" ON quiz_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_items.quiz_id
        AND (
          (quizzes.status = 'published' AND quizzes.kind = 'curated')
          OR (quizzes.kind = 'user_generated' AND quizzes.author_id = auth.uid())
        )
    )
  );

CREATE POLICY "Quiz authors can read their quiz items" ON quiz_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_items.quiz_id
        AND quizzes.author_id = auth.uid()
    )
  );

CREATE POLICY "Quiz authors can manage their quiz items" ON quiz_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_items.quiz_id
        AND quizzes.author_id = auth.uid()
    )
  );

COMMENT ON TABLE quizzes IS 'Quizzes — curated (admin-authored, slug-based URLs) or user_generated (Session D).';
COMMENT ON TABLE quiz_items IS 'Junction: questions in a quiz, ordered by position (0-indexed).';
