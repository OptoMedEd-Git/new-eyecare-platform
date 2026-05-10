-- 011_quiz_bank.sql
-- Quiz question bank schema. Each question has exactly 4 choices in this schema
-- (single-best-answer board prep style), with one choice marked correct.
-- Shared taxonomy: category_id references blog_categories (same as blog/courses).

CREATE TYPE quiz_difficulty AS ENUM ('foundational', 'intermediate', 'advanced');

CREATE TYPE quiz_question_type AS ENUM ('single_best_answer');

CREATE TABLE quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vignette text NOT NULL,
  question_text text NOT NULL,
  explanation text NOT NULL,
  image_url text,
  image_attribution text,
  question_type quiz_question_type NOT NULL DEFAULT 'single_best_answer',
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  target_audience text CHECK (target_audience IN ('student', 'resident', 'practicing', 'all')),
  difficulty quiz_difficulty NOT NULL DEFAULT 'intermediate',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX quiz_questions_status_idx ON quiz_questions(status);
CREATE INDEX quiz_questions_category_idx ON quiz_questions(category_id);
CREATE INDEX quiz_questions_published_idx ON quiz_questions(published_at DESC) WHERE status = 'published';

CREATE TABLE quiz_question_choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0 AND position <= 3),
  text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, position)
);

CREATE INDEX quiz_question_choices_question_idx ON quiz_question_choices(question_id);

DROP TRIGGER IF EXISTS quiz_questions_updated_at ON quiz_questions;
CREATE TRIGGER quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_question_choices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published questions" ON quiz_questions
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can read their own draft questions" ON quiz_questions
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage their own questions" ON quiz_questions
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Anyone can read choices of published questions" ON quiz_question_choices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      WHERE quiz_questions.id = quiz_question_choices.question_id
        AND quiz_questions.status = 'published'
    )
  );

CREATE POLICY "Question authors can read their question choices" ON quiz_question_choices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      WHERE quiz_questions.id = quiz_question_choices.question_id
        AND quiz_questions.author_id = auth.uid()
    )
  );

CREATE POLICY "Question authors can manage their question choices" ON quiz_question_choices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      WHERE quiz_questions.id = quiz_question_choices.question_id
        AND quiz_questions.author_id = auth.uid()
    )
  );

COMMENT ON TABLE quiz_questions IS 'Board-style multiple choice questions. v1 supports single-best-answer (4 choices, 1 correct).';
COMMENT ON TABLE quiz_question_choices IS '4 rows per question, positions 0-3. Exactly one row should have is_correct = true (enforced at app layer).';
