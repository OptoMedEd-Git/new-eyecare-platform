-- 010_learning_objectives.sql
-- Add learning_objectives column to both courses and lessons.
-- Stored as a JSON array of strings, mirroring the blog references pattern.
-- Empty array is the default; null is not used.

ALTER TABLE courses
  ADD COLUMN learning_objectives jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE lessons
  ADD COLUMN learning_objectives jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE courses
  ADD CONSTRAINT courses_learning_objectives_is_array
  CHECK (jsonb_typeof(learning_objectives) = 'array');

ALTER TABLE lessons
  ADD CONSTRAINT lessons_learning_objectives_is_array
  CHECK (jsonb_typeof(learning_objectives) = 'array');

COMMENT ON COLUMN courses.learning_objectives IS
  'Array of strings. Course-level learning objectives — what the learner will be able to do after completing the entire course.';

COMMENT ON COLUMN lessons.learning_objectives IS
  'Array of strings. Lesson-level learning objectives — what the learner will be able to do after this specific lesson.';
