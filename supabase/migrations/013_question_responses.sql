-- 013_question_responses.sql
-- Tracks every individual question answer a user submits in practice mode.
-- A single (user, question) pair can have many responses (one per attempt).
-- Sessions C+ may add quiz_attempt_id linking to formal quiz attempts; for now
-- responses are independent.

CREATE TABLE question_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  choice_id uuid NOT NULL REFERENCES quiz_question_choices(id) ON DELETE CASCADE,
  is_correct boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX question_responses_user_idx ON question_responses(user_id);
CREATE INDEX question_responses_user_question_idx ON question_responses(user_id, question_id);
CREATE INDEX question_responses_user_correct_idx ON question_responses(user_id, is_correct);
CREATE INDEX question_responses_answered_at_idx ON question_responses(answered_at DESC);

ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own responses" ON question_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" ON question_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE question_responses IS
  'Append-only log of every answer a user submits. One row per submission. Sessions C+ may add quiz_attempt_id for formal quizzes.';
