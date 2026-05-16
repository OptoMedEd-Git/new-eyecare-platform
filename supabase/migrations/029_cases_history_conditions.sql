-- 029_cases_history_conditions.sql
-- Structured ocular and medical history condition catalogs + per-case selections.
-- Laterality uses text + CHECK (no new enum) to avoid Part A/B migration split.

-- ---------------------------------------------------------------------------
-- Catalog tables
-- ---------------------------------------------------------------------------

CREATE TABLE ocular_history_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  has_laterality boolean NOT NULL DEFAULT true,
  position integer NOT NULL CHECK (position >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ocular_history_conditions_active_position_idx
  ON ocular_history_conditions(is_active, position)
  WHERE is_active = true;

CREATE TABLE medical_history_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  position integer NOT NULL CHECK (position >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX medical_history_conditions_active_position_idx
  ON medical_history_conditions(is_active, position)
  WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- Per-case selections
-- ---------------------------------------------------------------------------

CREATE TABLE case_ocular_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  condition_id uuid NOT NULL REFERENCES ocular_history_conditions(id) ON DELETE RESTRICT,
  laterality text CHECK (laterality IS NULL OR laterality IN ('OD', 'OS', 'OU', 'none')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, condition_id)
);

CREATE INDEX case_ocular_history_case_idx ON case_ocular_history(case_id);

CREATE TABLE case_medical_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  condition_id uuid NOT NULL REFERENCES medical_history_conditions(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, condition_id)
);

CREATE INDEX case_medical_history_case_idx ON case_medical_history(case_id);

COMMENT ON TABLE ocular_history_conditions IS 'Catalog of common ocular history conditions for case authoring checkboxes.';
COMMENT ON TABLE medical_history_conditions IS 'Catalog of common medical history conditions for case authoring checkboxes.';
COMMENT ON TABLE case_ocular_history IS 'Per-case selected ocular history conditions with optional laterality.';
COMMENT ON TABLE case_medical_history IS 'Per-case selected medical history conditions.';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS ocular_history_conditions_updated_at ON ocular_history_conditions;
CREATE TRIGGER ocular_history_conditions_updated_at
  BEFORE UPDATE ON ocular_history_conditions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS medical_history_conditions_updated_at ON medical_history_conditions;
CREATE TRIGGER medical_history_conditions_updated_at
  BEFORE UPDATE ON medical_history_conditions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE ocular_history_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_ocular_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_medical_history ENABLE ROW LEVEL SECURITY;

-- Catalogs: read active (or all for admins via manage policy)
CREATE POLICY "Anyone can read active ocular history conditions" ON ocular_history_conditions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage ocular history conditions" ON ocular_history_conditions
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Anyone can read active medical history conditions" ON medical_history_conditions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage medical history conditions" ON medical_history_conditions
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Per-case selections (mirror case_findings_rows)
CREATE POLICY "Anyone can read ocular history of published cases" ON case_ocular_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_ocular_history.case_id AND c.status = 'published'
    )
  );

CREATE POLICY "Case authors can read their case ocular history" ON case_ocular_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_ocular_history.case_id AND c.author_id = auth.uid()
    )
  );

CREATE POLICY "Case authors can manage their case ocular history" ON case_ocular_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_ocular_history.case_id AND c.author_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all case ocular history" ON case_ocular_history
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Anyone can read medical history of published cases" ON case_medical_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_medical_history.case_id AND c.status = 'published'
    )
  );

CREATE POLICY "Case authors can read their case medical history" ON case_medical_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_medical_history.case_id AND c.author_id = auth.uid()
    )
  );

CREATE POLICY "Case authors can manage their case medical history" ON case_medical_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_medical_history.case_id AND c.author_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all case medical history" ON case_medical_history
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- ---------------------------------------------------------------------------
-- Seed: ocular_history_conditions
-- ---------------------------------------------------------------------------

INSERT INTO ocular_history_conditions (name, has_laterality, position, is_active) VALUES
  ('Cataract surgery', true, 0, true),
  ('Refractive surgery (LASIK/PRK)', true, 1, true),
  ('Pterygium surgery', true, 2, true),
  ('Glaucoma', true, 3, true),
  ('Glaucoma surgery', true, 4, true),
  ('Retinal detachment / repair', true, 5, true),
  ('Macular degeneration', true, 6, true),
  ('Diabetic retinopathy', true, 7, true),
  ('Amblyopia', true, 8, true),
  ('Strabismus', true, 9, true),
  ('Dry eye disease', true, 10, true),
  ('Corneal scar / dystrophy', true, 11, true);

-- ---------------------------------------------------------------------------
-- Seed: medical_history_conditions
-- ---------------------------------------------------------------------------

INSERT INTO medical_history_conditions (name, position, is_active) VALUES
  ('Type 1 diabetes', 0, true),
  ('Type 2 diabetes', 1, true),
  ('Hypertension', 2, true),
  ('Hyperlipidemia', 3, true),
  ('Coronary artery disease', 4, true),
  ('Stroke / TIA', 5, true),
  ('Thyroid disease', 6, true),
  ('Autoimmune disease', 7, true),
  ('Cancer (active or history)', 8, true),
  ('Pregnancy (current)', 9, true);
