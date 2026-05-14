-- 026_multi_select_question_type.sql
-- Distinct question_type 'multi_select': reuses quiz_question_choices with multiple is_correct = true.
-- single_best_answer still requires exactly one correct choice; multi_select requires at least one.
-- Enforcement is deferred to end of transaction so batched choice inserts remain valid mid-transaction.

ALTER TYPE quiz_question_type ADD VALUE 'multi_select';

-- Replace 025's trigger: allow choices for single_best_answer OR multi_select (not true_false).
CREATE OR REPLACE FUNCTION quiz_block_choices_for_allowed_types()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM quiz_questions q
    WHERE q.id = NEW.question_id
      AND q.question_type NOT IN ('single_best_answer', 'multi_select')
  ) THEN
    RAISE EXCEPTION 'quiz_question_choices: rows only allowed when question_type is single_best_answer or multi_select';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quiz_question_choices_enforce_type ON quiz_question_choices;
CREATE TRIGGER quiz_question_choices_enforce_type
  BEFORE INSERT OR UPDATE ON quiz_question_choices
  FOR EACH ROW
  EXECUTE FUNCTION quiz_block_choices_for_allowed_types();

-- Deferred: single_best_answer → exactly one is_correct; multi_select → at least one is_correct.
CREATE OR REPLACE FUNCTION quiz_question_choices_deferred_validate_correct_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT q.id AS qid,
      q.question_type,
      (SELECT COUNT(*) FILTER (WHERE c.is_correct) FROM quiz_question_choices c WHERE c.question_id = q.id) AS n_cor
    FROM quiz_questions q
    WHERE q.question_type IN ('single_best_answer', 'multi_select')
      AND EXISTS (SELECT 1 FROM quiz_question_choices c2 WHERE c2.question_id = q.id)
  LOOP
    IF r.question_type = 'single_best_answer' THEN
      IF r.n_cor <> 1 THEN
        RAISE EXCEPTION 'Question % (single_best_answer): exactly one choice must be marked correct (found %)',
          r.qid, r.n_cor;
      END IF;
    ELSIF r.question_type = 'multi_select' THEN
      IF r.n_cor < 1 THEN
        RAISE EXCEPTION 'Question % (multi_select): at least one choice must be marked correct', r.qid;
      END IF;
    END IF;
  END LOOP;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS quiz_question_choices_deferred_validate ON quiz_question_choices;
CREATE CONSTRAINT TRIGGER quiz_question_choices_deferred_validate
  AFTER INSERT OR UPDATE OR DELETE ON quiz_question_choices
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION quiz_question_choices_deferred_validate_correct_counts();

ALTER TABLE question_responses
  DROP CONSTRAINT IF EXISTS question_responses_payload_choice_consistency;

ALTER TABLE question_responses
  ADD CONSTRAINT question_responses_payload_choice_consistency CHECK (
    (
      answer_payload->>'type' = 'single_best_answer'
      AND choice_id IS NOT NULL
    )
    OR (
      answer_payload->>'type' = 'true_false'
      AND choice_id IS NULL
    )
    OR (
      answer_payload->>'type' = 'multi_select'
      AND choice_id IS NULL
    )
  );

COMMENT ON COLUMN question_responses.answer_payload IS
  'Type-specific submitted answer. single_best_answer: { type, selectedChoiceId, partialCredit? }. true_false: { type, answer }. multi_select: { type, selectedChoiceIds[] }.';

COMMENT ON TABLE quiz_questions IS
  'Base question row. Type-specific data: quiz_question_choices (single_best_answer, multi_select), quiz_question_true_false (true_false).';

COMMENT ON TABLE quiz_question_choices IS
  'Satellite for single_best_answer and multi_select: ordered choices with is_correct (exactly one true for SBA; one or more for multi_select).';
