-- 009_course_progress_text_ids.sql
-- During the sample-data era, course/lesson definitions live in TS sample data, not the DB.
-- course_progress records completion using sample-data string IDs (e.g. "c1", "c1-l1").
-- A future migration can switch back to uuid FKs after CMS seeding.

-- Drop FKs to courses/lessons (Postgres default names from 008_courses.sql)
ALTER TABLE course_progress DROP CONSTRAINT IF EXISTS course_progress_course_id_fkey;
ALTER TABLE course_progress DROP CONSTRAINT IF EXISTS course_progress_lesson_id_fkey;

-- Widen columns to text (uuid casts to text as string representation; prefer inserting plain text IDs going forward)
ALTER TABLE course_progress ALTER COLUMN course_id TYPE text USING course_id::text;
ALTER TABLE course_progress ALTER COLUMN lesson_id TYPE text USING lesson_id::text;

-- UNIQUE (user_id, lesson_id) should survive ALTER TYPE; if not, add manually in Studio.

DROP INDEX IF EXISTS course_progress_user_course_idx;
DROP INDEX IF EXISTS course_progress_user_lesson_idx;
CREATE INDEX course_progress_user_course_idx ON course_progress(user_id, course_id);
CREATE INDEX course_progress_user_lesson_idx ON course_progress(user_id, lesson_id);

COMMENT ON COLUMN course_progress.course_id IS
  'Currently sample-data string IDs (e.g. "c1"). Will become uuid FK in a future migration.';
COMMENT ON COLUMN course_progress.lesson_id IS
  'Currently sample-data string IDs (e.g. "c1-l1"). Will become uuid FK in a future migration.';
