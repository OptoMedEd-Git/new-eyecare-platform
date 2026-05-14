-- 021_pathways.sql
-- Pathways: curated learning sequences. A pathway is a slugged collection of modules
-- in a strict linear order. Modules link to existing platform content (courses, quizzes,
-- flashcard decks, blog posts) or external resources. Per-user completion is tracked
-- in pathway_module_completions (foundation for P4–P5 gating/progress logic).

CREATE TYPE pathway_module_type AS ENUM (
  'course',
  'quiz',
  'flashcard_deck',
  'blog_post',
  'external_resource'
);

CREATE TABLE pathways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  target_audience text CHECK (target_audience IN ('student', 'resident', 'practicing', 'all')),
  difficulty quiz_difficulty,
  estimated_duration_text text,
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pathways_status_idx ON pathways(status);
CREATE INDEX pathways_slug_idx ON pathways(slug);
CREATE INDEX pathways_category_idx ON pathways(category_id);
CREATE INDEX pathways_published_idx ON pathways(published_at DESC) WHERE status = 'published';

CREATE TABLE pathway_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id uuid NOT NULL REFERENCES pathways(id) ON DELETE CASCADE,
  position integer NOT NULL,
  title text NOT NULL,
  context_markdown text,
  module_type pathway_module_type NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE SET NULL,
  flashcard_deck_id uuid REFERENCES flashcard_decks(id) ON DELETE SET NULL,
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE SET NULL,
  external_url text,
  external_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pathway_id, position),
  CONSTRAINT pathway_module_link_match CHECK (
    (module_type = 'course' AND course_id IS NOT NULL AND quiz_id IS NULL AND flashcard_deck_id IS NULL AND blog_post_id IS NULL AND external_url IS NULL) OR
    (module_type = 'quiz' AND quiz_id IS NOT NULL AND course_id IS NULL AND flashcard_deck_id IS NULL AND blog_post_id IS NULL AND external_url IS NULL) OR
    (module_type = 'flashcard_deck' AND flashcard_deck_id IS NOT NULL AND course_id IS NULL AND quiz_id IS NULL AND blog_post_id IS NULL AND external_url IS NULL) OR
    (module_type = 'blog_post' AND blog_post_id IS NOT NULL AND course_id IS NULL AND quiz_id IS NULL AND flashcard_deck_id IS NULL AND external_url IS NULL) OR
    (module_type = 'external_resource' AND external_url IS NOT NULL AND course_id IS NULL AND quiz_id IS NULL AND flashcard_deck_id IS NULL AND blog_post_id IS NULL)
  )
);

CREATE INDEX pathway_modules_pathway_idx ON pathway_modules(pathway_id, position);

CREATE TABLE pathway_module_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pathway_id uuid NOT NULL REFERENCES pathways(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES pathway_modules(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

CREATE INDEX pathway_completions_user_pathway_idx ON pathway_module_completions(user_id, pathway_id);

DROP TRIGGER IF EXISTS pathways_updated_at ON pathways;
CREATE TRIGGER pathways_updated_at
  BEFORE UPDATE ON pathways
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS pathway_modules_updated_at ON pathway_modules;
CREATE TRIGGER pathway_modules_updated_at
  BEFORE UPDATE ON pathway_modules
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_module_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published pathways" ON pathways
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can read their own draft pathways" ON pathways
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage their own pathways" ON pathways
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Anyone can read modules in published pathways" ON pathway_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pathways
      WHERE pathways.id = pathway_modules.pathway_id
        AND (pathways.status = 'published' OR pathways.author_id = auth.uid())
    )
  );

CREATE POLICY "Authors can manage modules in their own pathways" ON pathway_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pathways
      WHERE pathways.id = pathway_modules.pathway_id AND pathways.author_id = auth.uid()
    )
  );

CREATE POLICY "Users read own pathway completions" ON pathway_module_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own pathway completions" ON pathway_module_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own pathway completions" ON pathway_module_completions
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE pathways IS 'Curated learning sequences. Strict linear progression in P5; foundation built in P1.';
COMMENT ON TABLE pathway_modules IS 'Ordered modules within a pathway. Each module links to one content type (course/quiz/deck/post/external).';
COMMENT ON TABLE pathway_module_completions IS 'Per-user module completion log. Used for progress percentage (P4) and sequential gating (P5).';
