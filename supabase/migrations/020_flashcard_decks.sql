-- 020_flashcard_decks.sql
-- Curated flashcard decks. Named, slugged collections; cards many-to-many via flashcard_deck_items.
-- Reuses blog_categories and quiz_difficulty from existing schema.

CREATE TABLE flashcard_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  target_audience text CHECK (target_audience IN ('student', 'resident', 'practicing', 'all')),
  difficulty quiz_difficulty,
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX flashcard_decks_status_idx ON flashcard_decks(status);
CREATE INDEX flashcard_decks_slug_idx ON flashcard_decks(slug);
CREATE INDEX flashcard_decks_category_idx ON flashcard_decks(category_id);
CREATE INDEX flashcard_decks_published_idx ON flashcard_decks(published_at DESC) WHERE status = 'published';

CREATE TABLE flashcard_deck_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  flashcard_id uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  position integer NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deck_id, flashcard_id),
  UNIQUE (deck_id, position)
);

CREATE INDEX flashcard_deck_items_deck_idx ON flashcard_deck_items(deck_id, position);

DROP TRIGGER IF EXISTS flashcard_decks_updated_at ON flashcard_decks;
CREATE TRIGGER flashcard_decks_updated_at
  BEFORE UPDATE ON flashcard_decks
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_deck_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published flashcard decks" ON flashcard_decks
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can read own draft flashcard decks" ON flashcard_decks
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can insert own flashcard decks" ON flashcard_decks
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own flashcard decks" ON flashcard_decks
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own flashcard decks" ON flashcard_decks
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Read deck items for visible decks" ON flashcard_deck_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flashcard_decks d
      WHERE d.id = deck_id AND (d.status = 'published' OR d.author_id = auth.uid())
    )
  );

CREATE POLICY "Authors insert deck items" ON flashcard_deck_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM flashcard_decks d
      WHERE d.id = deck_id AND d.author_id = auth.uid()
    )
  );

CREATE POLICY "Authors update deck items" ON flashcard_deck_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM flashcard_decks d
      WHERE d.id = deck_id AND d.author_id = auth.uid()
    )
  );

CREATE POLICY "Authors delete deck items" ON flashcard_deck_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM flashcard_decks d
      WHERE d.id = deck_id AND d.author_id = auth.uid()
    )
  );

COMMENT ON TABLE flashcard_decks IS 'Curated flashcard collections. Cards join via flashcard_deck_items (many-to-many).';
COMMENT ON TABLE flashcard_deck_items IS 'Junction: cards in decks. position is display/review order within a deck.';
