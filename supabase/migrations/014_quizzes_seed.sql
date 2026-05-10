-- 014_quizzes_seed.sql
-- Sample curated quizzes. Run after migration 014 (and after quiz_questions seed if used).
-- Uses blog_categories slugs from migration 001.

DO $$
DECLARE
  quiz_id_1 uuid;
  quiz_id_2 uuid;
  author uuid := (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1);
  cat_glaucoma uuid := (SELECT id FROM blog_categories WHERE slug = 'glaucoma' LIMIT 1);
  cat_imaging uuid := (SELECT id FROM blog_categories WHERE slug = 'diagnostics-imaging' LIMIT 1);
  glaucoma_questions uuid[];
  imaging_questions uuid[];
  q uuid;
  pos integer;
BEGIN
  IF author IS NULL THEN
    RAISE EXCEPTION '014_quizzes_seed requires at least one profiles row';
  END IF;

  INSERT INTO quizzes (
    title,
    slug,
    description,
    kind,
    category_id,
    target_audience,
    difficulty,
    time_limit_minutes,
    is_featured,
    status,
    author_id,
    published_at
  )
  VALUES (
    'Glaucoma fundamentals review',
    'glaucoma-fundamentals-review',
    'A focused review covering aqueous dynamics, IOP assessment, optic nerve evaluation, and introductory management. Recommended for residents preparing for boards.',
    'curated',
    cat_glaucoma,
    'resident',
    'intermediate',
    20,
    false,
    'published',
    author,
    now()
  )
  RETURNING id INTO quiz_id_1;

  SELECT ARRAY(
    SELECT id
    FROM quiz_questions
    WHERE category_id = cat_glaucoma
      AND status = 'published'
    ORDER BY created_at ASC
    LIMIT 10
  )
  INTO glaucoma_questions;

  pos := 0;
  FOREACH q IN ARRAY glaucoma_questions LOOP
    INSERT INTO quiz_items (quiz_id, question_id, position) VALUES (quiz_id_1, q, pos);
    pos := pos + 1;
  END LOOP;

  INSERT INTO quizzes (
    title,
    slug,
    description,
    kind,
    category_id,
    target_audience,
    difficulty,
    time_limit_minutes,
    is_featured,
    status,
    author_id,
    published_at
  )
  VALUES (
    'OCT interpretation practice',
    'oct-interpretation-practice',
    'Practice interpreting OCT output systematically: RNFL maps, macular scans, and common artifacts. Untimed for deliberate study.',
    'curated',
    cat_imaging,
    'practicing',
    'advanced',
    NULL,
    true,
    'published',
    author,
    now()
  )
  RETURNING id INTO quiz_id_2;

  SELECT ARRAY(
    SELECT id
    FROM quiz_questions
    WHERE category_id = cat_imaging
      AND status = 'published'
    ORDER BY created_at ASC
    LIMIT 10
  )
  INTO imaging_questions;

  pos := 0;
  FOREACH q IN ARRAY imaging_questions LOOP
    INSERT INTO quiz_items (quiz_id, question_id, position) VALUES (quiz_id_2, q, pos);
    pos := pos + 1;
  END LOOP;
END $$;
