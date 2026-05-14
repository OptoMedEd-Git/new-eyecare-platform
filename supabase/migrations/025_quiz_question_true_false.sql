-- 025_quiz_question_true_false.sql
-- Distinct question_type 'true_false' with a minimal satellite (one boolean per question).
-- single_best_answer remains unchanged (quiz_question_choices satellite).
--
-- Design: satellite table `quiz_question_true_false` (not a nullable column on quiz_questions)
-- keeps the base row type-agnostic and mirrors the MCQ satellite pattern from 011.

ALTER TYPE quiz_question_type ADD VALUE 'true_false';

CREATE TABLE quiz_question_true_false (
  question_id uuid PRIMARY KEY REFERENCES quiz_questions(id) ON DELETE CASCADE,
  correct_answer boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX quiz_question_true_false_question_idx ON quiz_question_true_false(question_id);

COMMENT ON TABLE quiz_question_true_false IS
  'Satellite for question_type = true_false: exactly one row per question with the correct boolean.';

DROP TRIGGER IF EXISTS quiz_question_true_false_updated_at ON quiz_question_true_false;
CREATE TRIGGER quiz_question_true_false_updated_at
  BEFORE UPDATE ON quiz_question_true_false
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE quiz_question_true_false ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read true_false of published questions" ON quiz_question_true_false
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      WHERE quiz_questions.id = quiz_question_true_false.question_id
        AND quiz_questions.status = 'published'
    )
  );

CREATE POLICY "Question authors can read their question true_false" ON quiz_question_true_false
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      WHERE quiz_questions.id = quiz_question_true_false.question_id
        AND quiz_questions.author_id = auth.uid()
    )
  );

CREATE POLICY "Question authors can manage their question true_false" ON quiz_question_true_false
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      WHERE quiz_questions.id = quiz_question_true_false.question_id
        AND quiz_questions.author_id = auth.uid()
    )
  );

-- Enforce: choices only for single_best_answer; true_false satellite only for true_false questions.
CREATE OR REPLACE FUNCTION quiz_block_choices_for_non_sba()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM quiz_questions q
    WHERE q.id = NEW.question_id
      AND q.question_type <> 'single_best_answer'
  ) THEN
    RAISE EXCEPTION 'quiz_question_choices: rows only allowed when question_type is single_best_answer';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quiz_question_choices_enforce_type ON quiz_question_choices;
CREATE TRIGGER quiz_question_choices_enforce_type
  BEFORE INSERT OR UPDATE ON quiz_question_choices
  FOR EACH ROW
  EXECUTE FUNCTION quiz_block_choices_for_non_sba();

CREATE OR REPLACE FUNCTION quiz_block_true_false_for_non_tf()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM quiz_questions q
    WHERE q.id = NEW.question_id
      AND q.question_type = 'true_false'
  ) THEN
    RAISE EXCEPTION 'quiz_question_true_false: rows only allowed when question_type is true_false';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quiz_question_true_false_enforce_type ON quiz_question_true_false;
CREATE TRIGGER quiz_question_true_false_enforce_type
  BEFORE INSERT OR UPDATE ON quiz_question_true_false
  FOR EACH ROW
  EXECUTE FUNCTION quiz_block_true_false_for_non_tf();

-- True/false responses have no choice row; choice_id must be null for those payloads.
ALTER TABLE question_responses
  ALTER COLUMN choice_id DROP NOT NULL;

ALTER TABLE question_responses
  DROP CONSTRAINT IF EXISTS question_responses_payload_choice_consistency;

ALTER TABLE question_responses
  ADD CONSTRAINT question_responses_payload_choice_consistency CHECK (
    (
      answer_payload->>'type' = 'single_best_answer'
      AND choice_id IS NOT NULL
    )
    OR (
      answer_payload->>'type' = 'true_false'
      AND choice_id IS NULL
    )
  );

COMMENT ON COLUMN question_responses.choice_id IS
  'FK to quiz_question_choices for single_best_answer; NULL when answer_payload.type is true_false.';

COMMENT ON COLUMN question_responses.answer_payload IS
  'Type-specific submitted answer. single_best_answer: { type, version?, selectedChoiceId, partialCredit? }. true_false: { type, version?, answer: boolean }.';

COMMENT ON TABLE quiz_questions IS
  'Base question: stem, media, taxonomy, difficulty, status, question_type. Type-specific data: quiz_question_choices (single_best_answer), quiz_question_true_false (true_false).';
