-- 019_flagged_flashcards.sql
-- Per-user flagged flashcards for later review. Mirrors flagged_questions pattern.
-- Unique (user_id, flashcard_id) keeps flagging idempotent.

CREATE TABLE flagged_flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  flashcard_id uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  note text,
  flagged_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, flashcard_id)
);

CREATE INDEX flagged_flashcards_user_idx ON flagged_flashcards(user_id);
CREATE INDEX flagged_flashcards_flagged_at_idx ON flagged_flashcards(user_id, flagged_at DESC);

ALTER TABLE flagged_flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own flashcard flags" ON flagged_flashcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcard flags" ON flagged_flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard flags" ON flagged_flashcards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard flags" ON flagged_flashcards
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE flagged_flashcards IS 'Per-user flagged flashcards for later review. Optional note; unique per user and card.';
