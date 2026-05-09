-- 008_courses.sql
-- Adds courses, lessons, and course_progress tables.
-- Sessions 2 (real completion writes) and 3 (admin CMS) build on top of this.

-- Courses table (category FK targets existing blog_categories — shared taxonomy with blog)
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  target_audience text CHECK (target_audience IN ('student', 'resident', 'practicing', 'all')),
  cover_image_url text,
  cover_image_attribution text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX courses_status_idx ON courses(status);
CREATE INDEX courses_slug_idx ON courses(slug);
CREATE INDEX courses_published_at_idx ON courses(published_at DESC) WHERE status = 'published';

-- Lessons table
CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  estimated_minutes integer NOT NULL DEFAULT 0,
  order_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug),
  UNIQUE (course_id, order_index)
);

CREATE INDEX lessons_course_id_order_idx ON lessons(course_id, order_index);

-- Course progress (per-user, per-lesson completion)
CREATE TABLE course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX course_progress_user_course_idx ON course_progress(user_id, course_id);
CREATE INDEX course_progress_user_lesson_idx ON course_progress(user_id, lesson_id);

-- RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published courses" ON courses
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can read their own draft courses" ON courses
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage their own courses" ON courses
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Anyone can read lessons of published courses" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
        AND courses.status = 'published'
    )
  );

CREATE POLICY "Course authors can read all their course lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
        AND courses.author_id = auth.uid()
    )
  );

CREATE POLICY "Course authors can manage their lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
        AND courses.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own course progress" ON course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course progress" ON course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own course progress" ON course_progress
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at triggers — reuse set_updated_at() from 001_blog_cms_schema.sql
DROP TRIGGER IF EXISTS courses_updated_at ON courses;
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS lessons_updated_at ON lessons;
CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE courses IS 'Multi-lesson learning units. Each course has multiple ordered lessons.';
COMMENT ON TABLE lessons IS 'Individual lessons within a course. Content stored as TipTap JSON.';
COMMENT ON TABLE course_progress IS 'Per-user lesson completion tracking. Inserts on Mark complete.';
