-- 024_question_answer_payload.sql
-- Generalize question_responses for future question types while preserving history.
--
-- Context (already in schema from 011):
--   - quiz_questions is the BASE row (stem, taxonomy, difficulty, status, …).
--   - quiz_question_type enum + quiz_questions.question_type discriminator already exist;
--     today the only value is 'single_best_answer'.
--   - quiz_question_choices is the SATELLITE for single-best MCQ (positions, text, is_correct).
--
-- This migration adds answer_payload (jsonb) so responses are not tied solely to choice_id FK.
-- Existing rows: backfill from choice_id. New inserts must populate answer_payload (app layer).
-- choice_id remains for referential integrity and fast joins for the current type; future types may
-- make choice_id nullable in a later migration once all readers use answer_payload.

ALTER TABLE question_responses
  ADD COLUMN answer_payload jsonb;

UPDATE question_responses
SET answer_payload = jsonb_build_object(
  'type', 'single_best_answer',
  'version', 1,
  'selectedChoiceId', choice_id::text
)
WHERE answer_payload IS NULL;

ALTER TABLE question_responses
  ALTER COLUMN answer_payload SET NOT NULL;

ALTER TABLE question_responses
  ADD CONSTRAINT question_responses_answer_payload_has_type
  CHECK (
    answer_payload ? 'type'
    AND jsonb_typeof(answer_payload -> 'type') = 'string'
  );

COMMENT ON COLUMN question_responses.answer_payload IS
  'Type-specific submitted answer. single_best_answer: { type, version?, selectedChoiceId, partialCredit? { earned, max } }. Extensible for multi-select, ordering, etc.';

COMMENT ON TABLE quiz_questions IS
  'Base question: stem, media, taxonomy, difficulty, status, question_type. Type-specific rows live in satellite tables (quiz_question_choices for single_best_answer).';

COMMENT ON TABLE quiz_question_choices IS
  'Satellite for question_type = single_best_answer: ordered choices with is_correct flags.';
