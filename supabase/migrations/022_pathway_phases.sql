-- 022_pathway_phases.sql
-- Adds a grouping layer to pathways: a pathway contains ordered PHASES,
-- each phase contains ordered MODULES. Existing pathways are backfilled into
-- a single default phase so the model is uniform (no flat pathways).
--
-- Drops UNIQUE(pathway_id, position) on pathway_modules in favor of UNIQUE(phase_id, position).
-- Constraint name verified: PostgreSQL default for inline UNIQUE(pathway_id, position) is
-- pathway_modules_pathway_id_position_key (see 021_pathways.sql).
--
-- Zero-module pathways: every pathway receives a default "Curriculum" phase (position 1)
-- so admins never see a pathway with zero phases (V2-B UX).

CREATE TABLE pathway_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id uuid NOT NULL REFERENCES pathways(id) ON DELETE CASCADE,
  position integer NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pathway_id, position)
);

CREATE INDEX pathway_phases_pathway_idx ON pathway_phases(pathway_id, position);

DROP TRIGGER IF EXISTS pathway_phases_updated_at ON pathway_phases;
CREATE TRIGGER pathway_phases_updated_at
  BEFORE UPDATE ON pathway_phases
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Nullable first so existing rows can be backfilled
ALTER TABLE pathway_modules
  ADD COLUMN phase_id uuid REFERENCES pathway_phases(id) ON DELETE CASCADE;

-- One default phase per pathway (including pathways with zero modules)
INSERT INTO pathway_phases (pathway_id, position, title, description)
SELECT id, 1, 'Curriculum', NULL
FROM pathways;

UPDATE pathway_modules m
SET phase_id = p.id
FROM pathway_phases p
WHERE p.pathway_id = m.pathway_id
  AND p.position = 1;

ALTER TABLE pathway_modules
  ALTER COLUMN phase_id SET NOT NULL;

ALTER TABLE pathway_modules
  DROP CONSTRAINT pathway_modules_pathway_id_position_key;

ALTER TABLE pathway_modules
  ADD CONSTRAINT pathway_modules_phase_position_unique UNIQUE (phase_id, position);

CREATE INDEX pathway_modules_phase_idx ON pathway_modules(phase_id, position);

ALTER TABLE pathway_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read phases in published pathways" ON pathway_phases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pathways
      WHERE pathways.id = pathway_phases.pathway_id
        AND (pathways.status = 'published' OR pathways.author_id = auth.uid())
    )
  );

CREATE POLICY "Authors can manage phases in their own pathways" ON pathway_phases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pathways
      WHERE pathways.id = pathway_phases.pathway_id
        AND pathways.author_id = auth.uid()
    )
  );

COMMENT ON TABLE pathway_phases IS 'Ordered thematic groupings within a pathway. Each phase contains ordered pathway_modules.';
COMMENT ON COLUMN pathway_modules.phase_id IS 'Phase that owns this module; positions are unique per phase. pathway_id remains for convenience and RLS.';
