-- 027_image_stimulus_question_type.sql
-- Distinct question_type 'image_stimulus': clinical image as prompt + text choices (quiz_question_choices).
-- Stimulus URL uses existing quiz_questions.image_url (required when type = image_stimulus).
-- Scoring / answer_payload mirror single_best_answer (exactly one correct choice, choice_id populated).

ALTER TYPE quiz_question_type ADD VALUE 'image_stimulus';

-- Allow choices for image_stimulus alongside single_best_answer and multi_select.
CREATE OR REPLACE FUNCTION quiz_block_choices_for_allowed_types()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM quiz_questions q
    WHERE q.id = NEW.question_id
      AND q.question_type NOT IN ('single_best_answer', 'multi_select', 'image_stimulus')
  ) THEN
    RAISE EXCEPTION 'quiz_question_choices: rows only allowed when question_type is single_best_answer, multi_select, or image_stimulus';
  END IF;
  RETURN NEW;
END;
$$;

-- Deferred validation: image_stimulus uses same "exactly one correct" rule as single_best_answer.
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
    WHERE q.question_type IN ('single_best_answer', 'multi_select', 'image_stimulus')
      AND EXISTS (SELECT 1 FROM quiz_question_choices c2 WHERE c2.question_id = q.id)
  LOOP
    IF r.question_type IN ('single_best_answer', 'image_stimulus') THEN
      IF r.n_cor <> 1 THEN
        RAISE EXCEPTION 'Question % (type %): exactly one choice must be marked correct (found %)',
          r.qid, r.question_type, r.n_cor;
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

-- image_stimulus must have a non-empty stimulus URL on the base row.
ALTER TABLE quiz_questions
  ADD CONSTRAINT quiz_questions_image_stimulus_requires_image_url
  CHECK (
    question_type <> 'image_stimulus'
    OR (
      image_url IS NOT NULL
      AND length(trim(image_url)) > 0
    )
  );

-- answer_payload + choice_id consistency: image_stimulus matches single_best_answer (denormalized choice_id).
ALTER TABLE question_responses
  DROP CONSTRAINT IF EXISTS question_responses_payload_choice_consistency;

ALTER TABLE question_responses
  ADD CONSTRAINT question_responses_payload_choice_consistency CHECK (
    (
      answer_payload->>'type' = 'single_best_answer'
      AND choice_id IS NOT NULL
    )
    OR (
      answer_payload->>'type' = 'image_stimulus'
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
  'Type-specific submitted answer. single_best_answer / image_stimulus: { type, selectedChoiceId }. true_false: { type, answer }. multi_select: { type, selectedChoiceIds[] }.';

COMMENT ON TABLE quiz_questions IS
  'Base question row. Type-specific: quiz_question_choices (single_best_answer, multi_select, image_stimulus), quiz_question_true_false (true_false). image_stimulus requires image_url.';

COMMENT ON TABLE quiz_question_choices IS
  'Satellite for single_best_answer, multi_select, and image_stimulus: ordered choices with is_correct.';
