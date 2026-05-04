-- =====================================================
-- OptoMedEd Blog CMS Schema Migration
-- Session 1 of multi-session blog infrastructure build
-- =====================================================

-- =====================================================
-- 1. Add role column to existing profiles table
-- =====================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member'
  CHECK (role IN ('admin', 'contributor', 'member'));

CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- =====================================================
-- 2. Create blog_categories table
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_categories_slug_idx ON blog_categories(slug);

-- =====================================================
-- 3. Create blog_tags table
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_tags_slug_idx ON blog_tags(slug);

-- =====================================================
-- 4. Create blog_posts table
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  cover_image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category_id uuid NOT NULL REFERENCES blog_categories(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  reading_time_minutes integer,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);
CREATE INDEX IF NOT EXISTS blog_posts_author_idx ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts(published_at DESC) WHERE status = 'published';

-- =====================================================
-- 5. Create blog_post_tags junction table
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS blog_post_tags_tag_idx ON blog_post_tags(tag_id);

-- =====================================================
-- 6. Update trigger functions for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_categories_updated_at ON blog_categories;
CREATE TRIGGER blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- 7. Helper function: get user role
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- 8. Enable Row Level Security on new tables
-- =====================================================
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. RLS Policies: blog_categories
-- =====================================================
-- Anyone can read categories
DROP POLICY IF EXISTS "blog_categories_select" ON blog_categories;
CREATE POLICY "blog_categories_select" ON blog_categories
  FOR SELECT USING (true);

-- Only admins can insert/update/delete categories
DROP POLICY IF EXISTS "blog_categories_admin_all" ON blog_categories;
CREATE POLICY "blog_categories_admin_all" ON blog_categories
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- 10. RLS Policies: blog_tags
-- =====================================================
-- Anyone can read tags
DROP POLICY IF EXISTS "blog_tags_select" ON blog_tags;
CREATE POLICY "blog_tags_select" ON blog_tags
  FOR SELECT USING (true);

-- Admins and contributors can insert tags (needed when creating posts)
DROP POLICY IF EXISTS "blog_tags_insert" ON blog_tags;
CREATE POLICY "blog_tags_insert" ON blog_tags
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'contributor')
  );

-- Only admins can update/delete tags
DROP POLICY IF EXISTS "blog_tags_admin_modify" ON blog_tags;
CREATE POLICY "blog_tags_admin_modify" ON blog_tags
  FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "blog_tags_admin_delete" ON blog_tags;
CREATE POLICY "blog_tags_admin_delete" ON blog_tags
  FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- 11. RLS Policies: blog_posts
-- =====================================================
-- Public can read published posts
DROP POLICY IF EXISTS "blog_posts_public_read" ON blog_posts;
CREATE POLICY "blog_posts_public_read" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Admins can read all posts
DROP POLICY IF EXISTS "blog_posts_admin_read_all" ON blog_posts;
CREATE POLICY "blog_posts_admin_read_all" ON blog_posts
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- Contributors can read their own posts (any status)
DROP POLICY IF EXISTS "blog_posts_contributor_read_own" ON blog_posts;
CREATE POLICY "blog_posts_contributor_read_own" ON blog_posts
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'contributor'
    AND author_id = auth.uid()
  );

-- Admins and contributors can create posts
DROP POLICY IF EXISTS "blog_posts_authors_insert" ON blog_posts;
CREATE POLICY "blog_posts_authors_insert" ON blog_posts
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'contributor')
    AND author_id = auth.uid()
  );

-- Admins can update any post
DROP POLICY IF EXISTS "blog_posts_admin_update" ON blog_posts;
CREATE POLICY "blog_posts_admin_update" ON blog_posts
  FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- Contributors can update only their own posts
DROP POLICY IF EXISTS "blog_posts_contributor_update_own" ON blog_posts;
CREATE POLICY "blog_posts_contributor_update_own" ON blog_posts
  FOR UPDATE USING (
    get_user_role(auth.uid()) = 'contributor'
    AND author_id = auth.uid()
  );

-- Admins can delete any post
DROP POLICY IF EXISTS "blog_posts_admin_delete" ON blog_posts;
CREATE POLICY "blog_posts_admin_delete" ON blog_posts
  FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- Contributors can delete only their own posts
DROP POLICY IF EXISTS "blog_posts_contributor_delete_own" ON blog_posts;
CREATE POLICY "blog_posts_contributor_delete_own" ON blog_posts
  FOR DELETE USING (
    get_user_role(auth.uid()) = 'contributor'
    AND author_id = auth.uid()
  );

-- =====================================================
-- 12. RLS Policies: blog_post_tags
-- =====================================================
-- Anyone can read tag associations of published posts
DROP POLICY IF EXISTS "blog_post_tags_public_read" ON blog_post_tags;
CREATE POLICY "blog_post_tags_public_read" ON blog_post_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_post_tags.post_id
      AND (
        blog_posts.status = 'published'
        OR get_user_role(auth.uid()) = 'admin'
        OR (get_user_role(auth.uid()) = 'contributor' AND blog_posts.author_id = auth.uid())
      )
    )
  );

-- Authors can manage tag associations on posts they can edit
DROP POLICY IF EXISTS "blog_post_tags_author_manage" ON blog_post_tags;
CREATE POLICY "blog_post_tags_author_manage" ON blog_post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_post_tags.post_id
      AND (
        get_user_role(auth.uid()) = 'admin'
        OR (get_user_role(auth.uid()) = 'contributor' AND blog_posts.author_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_post_tags.post_id
      AND (
        get_user_role(auth.uid()) = 'admin'
        OR (get_user_role(auth.uid()) = 'contributor' AND blog_posts.author_id = auth.uid())
      )
    )
  );

-- =====================================================
-- 13. Update profiles RLS to allow admins to read all
-- =====================================================
DROP POLICY IF EXISTS "profiles_admin_read_all" ON profiles;
CREATE POLICY "profiles_admin_read_all" ON profiles
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- 14. Seed initial categories
-- =====================================================
INSERT INTO blog_categories (slug, name, description) VALUES
  ('glaucoma', 'Glaucoma', 'Diagnosis, treatment, and management of glaucoma and related optic nerve diseases.'),
  ('anterior-segment', 'Anterior Segment', 'Cornea, conjunctiva, iris, lens, and related anterior segment conditions.'),
  ('posterior-segment', 'Posterior Segment', 'Retina, vitreous, and posterior segment pathologies.'),
  ('refraction-optics', 'Refraction & Optics', 'Refractive errors, lens prescriptions, and optical principles.'),
  ('pediatric', 'Pediatric Eye Care', 'Eye care considerations for children and developmental visual conditions.'),
  ('neuro-ophthalmology', 'Neuro-Ophthalmology', 'Visual pathway disorders, neurological conditions affecting vision.'),
  ('pharmacology', 'Pharmacology', 'Ocular medications, mechanisms, indications, and adverse effects.'),
  ('diagnostics-imaging', 'Diagnostics & Imaging', 'OCT, fundus photography, visual fields, and other diagnostic modalities.'),
  ('surgery', 'Surgery', 'Ophthalmic surgical techniques, procedures, and outcomes.'),
  ('public-health', 'Public Health & Policy', 'Population eye health, healthcare policy, and accessibility.'),
  ('career-education', 'Career & Education', 'Training, career paths, and continuing education in eye care.'),
  ('platform-updates', 'Platform Updates', 'News, features, and updates from the OptoMedEd team.')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Migration complete
-- =====================================================