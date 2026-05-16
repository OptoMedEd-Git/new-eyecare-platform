-- 031_case_custom_history_conditions.sql
-- Structured per-case custom history conditions (replaces free-text Other fields in authoring UI).

CREATE TABLE case_custom_history_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  history_type text NOT NULL CHECK (history_type IN ('ocular', 'medical')),
  condition_text text NOT NULL,
  laterality text CHECK (laterality IS NULL OR laterality IN ('OD', 'OS', 'OU', 'none')),
  position integer NOT NULL CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX case_custom_history_conditions_case_idx
  ON case_custom_history_conditions(case_id);

CREATE INDEX case_custom_history_conditions_case_type_idx
  ON case_custom_history_conditions(case_id, history_type);

COMMENT ON TABLE case_custom_history_conditions IS 'Author-entered custom history conditions per case (not from catalog).';

DROP TRIGGER IF EXISTS case_custom_history_conditions_updated_at ON case_custom_history_conditions;
CREATE TRIGGER case_custom_history_conditions_updated_at
  BEFORE UPDATE ON case_custom_history_conditions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE case_custom_history_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read custom history of published cases" ON case_custom_history_conditions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_custom_history_conditions.case_id AND c.status = 'published'
    )
  );

CREATE POLICY "Case authors can read their case custom history" ON case_custom_history_conditions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_custom_history_conditions.case_id AND c.author_id = auth.uid()
    )
  );

CREATE POLICY "Case authors can manage their case custom history" ON case_custom_history_conditions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_custom_history_conditions.case_id AND c.author_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all case custom history" ON case_custom_history_conditions
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');
