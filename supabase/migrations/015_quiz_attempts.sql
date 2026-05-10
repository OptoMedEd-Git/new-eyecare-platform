-- 015_quiz_attempts.sql
-- A user's attempt at a quiz. One row per attempt; an in-progress attempt
-- has submitted_at = null. Score fields populated at submission.

CREATE TYPE quiz_attempt_status AS ENUM ('in_progress', 'submitted', 'abandoned');

CREATE TABLE quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  status quiz_attempt_status NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  abandoned_at timestamptz,
  score_correct integer,
  score_total integer,
  time_limit_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX quiz_attempts_user_quiz_idx ON quiz_attempts(user_id, quiz_id);
CREATE INDEX quiz_attempts_user_status_idx ON quiz_attempts(user_id, status);
CREATE INDEX quiz_attempts_in_progress_idx ON quiz_attempts(user_id, quiz_id) WHERE status = 'in_progress';

ALTER TABLE question_responses
  ADD COLUMN quiz_attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE;

CREATE INDEX question_responses_attempt_idx ON question_responses(quiz_attempt_id) WHERE quiz_attempt_id IS NOT NULL;

CREATE UNIQUE INDEX question_responses_attempt_question_unique
  ON question_responses(quiz_attempt_id, question_id)
  WHERE quiz_attempt_id IS NOT NULL;

DROP TRIGGER IF EXISTS quiz_attempts_updated_at ON quiz_attempts;
CREATE TRIGGER quiz_attempts_updated_at
  BEFORE UPDATE ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own attempts" ON quiz_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own responses" ON question_responses
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE quiz_attempts IS 'A user attempting a quiz. status=in_progress while taking; submitted on finish; abandoned if user explicitly abandons.';
COMMENT ON COLUMN quiz_attempts.time_limit_minutes IS 'Snapshot of the quiz time_limit at attempt start. If quiz is later edited to change time limit, in-progress attempts retain original.';
COMMENT ON COLUMN question_responses.quiz_attempt_id IS 'Formal quiz attempt; null = practice mode response.';
