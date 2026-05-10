-- 016_flagged_questions.sql
-- Per-user flagged questions for later review. A user can flag any question they've
-- encountered (or any published question). Unique on (user_id, question_id) so
-- flagging is idempotent — flagging twice doesn't create duplicates.

CREATE TABLE flagged_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  note text,
  flagged_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX flagged_questions_user_idx ON flagged_questions(user_id);
CREATE INDEX flagged_questions_flagged_at_idx ON flagged_questions(user_id, flagged_at DESC);

ALTER TABLE flagged_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own flags" ON flagged_questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flags" ON flagged_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flags" ON flagged_questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flags" ON flagged_questions
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE flagged_questions IS 'Per-user flagged questions for later review. note is optional free-text annotation.';
