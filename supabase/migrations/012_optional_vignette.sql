-- 012_optional_vignette.sql
-- Make vignette optional on quiz_questions. Direct questions (no clinical
-- scenario) don't need a vignette.

ALTER TABLE quiz_questions ALTER COLUMN vignette DROP NOT NULL;

COMMENT ON COLUMN quiz_questions.vignette IS
  'Optional clinical scenario. Some questions are direct and have no vignette.';
