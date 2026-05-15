-- 028_cases_schema.sql
-- Case-based questions: clinical case parent + structured findings + ancillary tests +
-- ordered quiz_questions junction + case_attempts linked to question_responses.
--
-- Findings model (locked): omitting a table = zero case_findings_rows for that finding_type.
-- Showing a table = one row per catalog entry for that type (NULL od/os until filled or normals inserted).
-- Skipping a row within a shown table = row exists with both od_value and os_value NULL.
--
-- Storage: create bucket `case-ancillary-media` in Supabase Dashboard (public) before applying
-- storage policies at the bottom of this file (mirrors blog-images pattern).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE case_finding_type AS ENUM (
  'vision_refraction',
  'preliminary',
  'anterior_segment',
  'posterior_segment'
);

CREATE TYPE case_patient_sex AS ENUM ('M', 'F', 'Other', 'Unspecified');

CREATE TYPE case_attempt_status AS ENUM ('in_progress', 'submitted', 'abandoned');

-- ---------------------------------------------------------------------------
-- cases (parent)
-- ---------------------------------------------------------------------------

CREATE TABLE cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  chief_complaint text,
  hpi text,
  patient_age integer CHECK (patient_age IS NULL OR (patient_age >= 0 AND patient_age <= 150)),
  patient_sex case_patient_sex,
  patient_ethnicity text,
  past_ocular_history text,
  past_medical_history text,
  medications text,
  allergies text,
  category_id uuid NOT NULL REFERENCES blog_categories(id) ON DELETE RESTRICT,
  difficulty quiz_difficulty NOT NULL DEFAULT 'intermediate',
  target_audience text NOT NULL CHECK (target_audience IN ('student', 'resident', 'practicing', 'all')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  learning_objectives text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cases_status_idx ON cases(status);
CREATE INDEX cases_slug_idx ON cases(slug);
CREATE INDEX cases_category_idx ON cases(category_id);
CREATE INDEX cases_published_idx ON cases(published_at DESC) WHERE status = 'published';
CREATE INDEX cases_author_idx ON cases(author_id);

COMMENT ON TABLE cases IS
  'Clinical case parent: narrative, demographics, taxonomy. Questions reuse quiz_questions via case_questions.';

-- ---------------------------------------------------------------------------
-- finding_row_catalog (reference rows for the four standard finding tables)
-- ---------------------------------------------------------------------------

CREATE TABLE finding_row_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_type case_finding_type NOT NULL,
  row_key text NOT NULL,
  row_label text NOT NULL,
  default_normal_od text,
  default_normal_os text,
  position integer NOT NULL CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (finding_type, row_key)
);

CREATE INDEX finding_row_catalog_type_position_idx ON finding_row_catalog(finding_type, position);

COMMENT ON TABLE finding_row_catalog IS
  'Canonical rows per standard finding table; powers admin UI and insert-normal-values defaults.';

-- ---------------------------------------------------------------------------
-- case_findings_rows (per-case OD/OS values; one row per catalog key when table is shown)
-- ---------------------------------------------------------------------------

CREATE TABLE case_findings_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  finding_type case_finding_type NOT NULL,
  row_key text NOT NULL,
  od_value text,
  os_value text,
  position integer NOT NULL CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, finding_type, row_key),
  CONSTRAINT case_findings_rows_catalog_key_fk FOREIGN KEY (finding_type, row_key)
    REFERENCES finding_row_catalog(finding_type, row_key)
);

CREATE INDEX case_findings_rows_case_type_idx ON case_findings_rows(case_id, finding_type, position);

COMMENT ON TABLE case_findings_rows IS
  'Per-case findings. Presence of any row for a finding_type means that table is shown. All catalog rows typically exist with NULL or filled OD/OS.';

-- ---------------------------------------------------------------------------
-- ancillary_test_types (curated dropdown; seedable)
-- ---------------------------------------------------------------------------

CREATE TABLE ancillary_test_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ancillary_test_types_active_position_idx ON ancillary_test_types(is_active, position)
  WHERE is_active = true;

COMMENT ON TABLE ancillary_test_types IS
  'Curated ancillary test names for the case authoring dropdown; custom tests use case_ancillary_tests.custom_test_name.';

-- ---------------------------------------------------------------------------
-- case_ancillary_tests (variable rows per case)
-- ---------------------------------------------------------------------------

CREATE TABLE case_ancillary_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  test_type_id uuid REFERENCES ancillary_test_types(id) ON DELETE SET NULL,
  custom_test_name text,
  reliability text,
  od_findings text,
  os_findings text,
  notes text,
  position integer NOT NULL CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT case_ancillary_tests_type_or_custom CHECK (
    test_type_id IS NOT NULL OR (custom_test_name IS NOT NULL AND length(trim(custom_test_name)) > 0)
  )
);

CREATE INDEX case_ancillary_tests_case_position_idx ON case_ancillary_tests(case_id, position);

COMMENT ON TABLE case_ancillary_tests IS
  'Per-case ancillary testing entries. Max 4 media items per test enforced at application layer.';

-- ---------------------------------------------------------------------------
-- case_ancillary_test_media
-- ---------------------------------------------------------------------------

CREATE TABLE case_ancillary_test_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ancillary_test_id uuid NOT NULL REFERENCES case_ancillary_tests(id) ON DELETE CASCADE,
  media_url text NOT NULL CHECK (length(trim(media_url)) > 0),
  caption text,
  position integer NOT NULL CHECK (position >= 0 AND position <= 3),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX case_ancillary_test_media_test_idx ON case_ancillary_test_media(ancillary_test_id, position);

COMMENT ON TABLE case_ancillary_test_media IS
  'Images/files for an ancillary test entry (Supabase Storage URL). Max 4 per test (positions 0–3) enforced in app.';

-- ---------------------------------------------------------------------------
-- case_questions (ordered junction to quiz_questions)
-- ---------------------------------------------------------------------------

CREATE TABLE case_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE RESTRICT,
  position integer NOT NULL CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, position),
  UNIQUE (case_id, question_id)
);

CREATE INDEX case_questions_case_position_idx ON case_questions(case_id, position);
CREATE INDEX case_questions_question_idx ON case_questions(question_id);

COMMENT ON TABLE case_questions IS
  'Ordered quiz_questions within a case. Reuses the full question bank (all question_type values).';

-- ---------------------------------------------------------------------------
-- case_attempts
-- ---------------------------------------------------------------------------

CREATE TABLE case_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  status case_attempt_status NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score_correct integer CHECK (score_correct IS NULL OR score_correct >= 0),
  score_total integer CHECK (score_total IS NULL OR score_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX case_attempts_user_case_idx ON case_attempts(user_id, case_id);
CREATE INDEX case_attempts_user_status_idx ON case_attempts(user_id, status);
CREATE INDEX case_attempts_in_progress_idx ON case_attempts(user_id, case_id)
  WHERE status = 'in_progress';

COMMENT ON TABLE case_attempts IS
  'User progress through a case. Per-question answers live in question_responses.case_attempt_id.';

-- ---------------------------------------------------------------------------
-- question_responses: sibling nullable case_attempt_id (practice = both null)
-- ---------------------------------------------------------------------------

ALTER TABLE question_responses
  ADD COLUMN case_attempt_id uuid REFERENCES case_attempts(id) ON DELETE CASCADE;

CREATE INDEX question_responses_case_attempt_idx ON question_responses(case_attempt_id)
  WHERE case_attempt_id IS NOT NULL;

CREATE UNIQUE INDEX question_responses_case_attempt_question_unique
  ON question_responses(case_attempt_id, question_id)
  WHERE case_attempt_id IS NOT NULL;

ALTER TABLE question_responses
  ADD CONSTRAINT question_responses_single_attempt_context CHECK (
    NOT (quiz_attempt_id IS NOT NULL AND case_attempt_id IS NOT NULL)
  );

COMMENT ON COLUMN question_responses.case_attempt_id IS
  'Formal case attempt; null when practice mode or quiz attempt. Mutually exclusive with quiz_attempt_id.';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS cases_updated_at ON cases;
CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS finding_row_catalog_updated_at ON finding_row_catalog;
CREATE TRIGGER finding_row_catalog_updated_at
  BEFORE UPDATE ON finding_row_catalog
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS case_findings_rows_updated_at ON case_findings_rows;
CREATE TRIGGER case_findings_rows_updated_at
  BEFORE UPDATE ON case_findings_rows
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS ancillary_test_types_updated_at ON ancillary_test_types;
CREATE TRIGGER ancillary_test_types_updated_at
  BEFORE UPDATE ON ancillary_test_types
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS case_ancillary_tests_updated_at ON case_ancillary_tests;
CREATE TRIGGER case_ancillary_tests_updated_at
  BEFORE UPDATE ON case_ancillary_tests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS case_attempts_updated_at ON case_attempts;
CREATE TRIGGER case_attempts_updated_at
  BEFORE UPDATE ON case_attempts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_row_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_findings_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ancillary_test_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_ancillary_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_ancillary_test_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_attempts ENABLE ROW LEVEL SECURITY;

-- cases
CREATE POLICY "Anyone can read published cases" ON cases
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can read their own draft cases" ON cases
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage their own cases" ON cases
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all cases" ON cases
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- finding_row_catalog (reference data)
CREATE POLICY "Anyone can read finding row catalog" ON finding_row_catalog
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage finding row catalog" ON finding_row_catalog
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- case_findings_rows
CREATE POLICY "Anyone can read findings of published cases" ON case_findings_rows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_findings_rows.case_id AND c.status = 'published'
    )
  );

CREATE POLICY "Case authors can read their case findings" ON case_findings_rows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_findings_rows.case_id AND c.author_id = auth.uid()
    )
  );

CREATE POLICY "Case authors can manage their case findings" ON case_findings_rows
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_findings_rows.case_id AND c.author_id = auth.uid()
    )
  );

-- ancillary_test_types
CREATE POLICY "Anyone can read active ancillary test types" ON ancillary_test_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage ancillary test types" ON ancillary_test_types
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- case_ancillary_tests
CREATE POLICY "Anyone can read ancillary tests of published cases" ON case_ancillary_tests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_ancillary_tests.case_id AND c.status = 'published'
    )
  );

CREATE POLICY "Case authors can manage their ancillary tests" ON case_ancillary_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_ancillary_tests.case_id AND c.author_id = auth.uid()
    )
  );

-- case_ancillary_test_media
CREATE POLICY "Anyone can read media for published case ancillary tests" ON case_ancillary_test_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM case_ancillary_tests t
      JOIN cases c ON c.id = t.case_id
      WHERE t.id = case_ancillary_test_media.ancillary_test_id AND c.status = 'published'
    )
  );

CREATE POLICY "Case authors can manage their ancillary test media" ON case_ancillary_test_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM case_ancillary_tests t
      JOIN cases c ON c.id = t.case_id
      WHERE t.id = case_ancillary_test_media.ancillary_test_id AND c.author_id = auth.uid()
    )
  );

-- case_questions
CREATE POLICY "Anyone can read questions of published cases" ON case_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_questions.case_id AND c.status = 'published'
    )
  );

CREATE POLICY "Case authors can manage their case questions" ON case_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_questions.case_id AND c.author_id = auth.uid()
    )
  );

-- case_attempts
CREATE POLICY "Users can read their own case attempts" ON case_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own case attempts" ON case_attempts
  FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Seed: finding_row_catalog (22 rows)
-- ---------------------------------------------------------------------------

INSERT INTO finding_row_catalog (finding_type, row_key, row_label, default_normal_od, default_normal_os, position) VALUES
  ('vision_refraction', 'va_sc', 'VA (sc)', '20/20', '20/20', 0),
  ('vision_refraction', 'va_cc', 'VA (cc)', '20/20', '20/20', 1),
  ('vision_refraction', 'presenting', 'Presenting', 'Plano', 'Plano', 2),
  ('vision_refraction', 'ar', 'AR', '−0.50 DS', '−0.25 DS', 3),
  ('vision_refraction', 'mrx', 'MRx', '−0.50 DS', '−0.25 DS', 4),
  ('vision_refraction', 'lens', 'Lens', 'Clear', 'Clear', 5),
  ('preliminary', 'pupils', 'Pupils', 'PERRL, no APD', 'PERRL, no APD', 0),
  ('preliminary', 'eoms', 'EOMs', 'Full, smooth', 'Full, smooth', 1),
  ('preliminary', 'cover_test', 'Cover test', 'Orthophoria at distance and near', 'Orthophoria at distance and near', 2),
  ('preliminary', 'cvf', 'CVF', 'Full to confrontation', 'Full to confrontation', 3),
  ('preliminary', 'iop', 'IOP', '15 mmHg', '15 mmHg', 4),
  ('anterior_segment', 'adnexa', 'Adnexa', 'Normal', 'Normal', 0),
  ('anterior_segment', 'lids_lashes', 'Lids & lashes', 'Normal', 'Normal', 1),
  ('anterior_segment', 'cornea', 'Cornea', 'Clear', 'Clear', 2),
  ('anterior_segment', 'conjunctiva', 'Conjunctiva', 'White, quiet', 'White, quiet', 3),
  ('anterior_segment', 'iris', 'Iris', 'Normal architecture', 'Normal architecture', 4),
  ('anterior_segment', 'lens', 'Lens', 'Clear', 'Clear', 5),
  ('anterior_segment', 'vitreous', 'Vitreous', 'Clear', 'Clear', 6),
  ('posterior_segment', 'optic_nerve', 'Optic nerve', 'Pink, distinct margins, C/D 0.3', 'Pink, distinct margins, C/D 0.3', 0),
  ('posterior_segment', 'macula', 'Macula', 'Flat, intact foveal reflex', 'Flat, intact foveal reflex', 1),
  ('posterior_segment', 'retinal_vessels', 'Retinal vessels', 'Normal caliber, no hemorrhages', 'Normal caliber, no hemorrhages', 2),
  ('posterior_segment', 'periphery', 'Periphery', 'No tears, holes, or detachment', 'No tears, holes, or detachment', 3);

-- ---------------------------------------------------------------------------
-- Seed: ancillary_test_types (starter list)
-- ---------------------------------------------------------------------------

INSERT INTO ancillary_test_types (name, category, position, is_active) VALUES
  ('OCT Macula', 'Imaging', 0, true),
  ('OCT RNFL', 'Imaging', 1, true),
  ('OCT-A', 'Imaging', 2, true),
  ('Fundus photography', 'Photography', 3, true),
  ('Fundus autofluorescence', 'Photography', 4, true),
  ('HVF 24-2', 'Visual field', 5, true),
  ('HVF 10-2', 'Visual field', 6, true),
  ('Gonioscopy', 'Other', 7, true),
  ('Pachymetry', 'Other', 8, true),
  ('Specular microscopy', 'Other', 9, true),
  ('B-scan ultrasound', 'Imaging', 10, true),
  ('Fluorescein angiography', 'Imaging', 11, true),
  ('Corneal topography', 'Other', 12, true),
  ('Anterior segment OCT', 'Imaging', 13, true),
  ('Color vision testing', 'Other', 14, true);

-- ---------------------------------------------------------------------------
-- Storage RLS: case-ancillary-media bucket (create bucket manually first)
-- ---------------------------------------------------------------------------
-- Dashboard: Storage > New bucket > Name: case-ancillary-media, Public: true

DROP POLICY IF EXISTS "case_ancillary_media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "case_ancillary_media_authoring_insert" ON storage.objects;
DROP POLICY IF EXISTS "case_ancillary_media_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "case_ancillary_media_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "case_ancillary_media_admin_all" ON storage.objects;

CREATE POLICY "case_ancillary_media_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'case-ancillary-media');

CREATE POLICY "case_ancillary_media_authoring_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'case-ancillary-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.get_user_role(auth.uid()) IN ('admin', 'contributor')
);

CREATE POLICY "case_ancillary_media_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'case-ancillary-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'case-ancillary-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "case_ancillary_media_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'case-ancillary-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "case_ancillary_media_admin_all"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'case-ancillary-media'
  AND public.get_user_role(auth.uid()) = 'admin'
)
WITH CHECK (
  bucket_id = 'case-ancillary-media'
  AND public.get_user_role(auth.uid()) = 'admin'
);
