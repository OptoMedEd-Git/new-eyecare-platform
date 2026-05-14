-- 023_pathway_published_snapshot.sql
-- V2-D-pre: published_structure JSONB snapshot for learner-facing pathway structure.
-- Live pathway_phases / pathway_modules remain the admin working copy; learners read the snapshot.
-- Soft-delete (removed_at) allows tombstone rows so snapshot references stay valid until republish cleanup.

ALTER TABLE pathway_modules
  ADD COLUMN removed_at timestamptz;

ALTER TABLE pathway_phases
  ADD COLUMN removed_at timestamptz;

COMMENT ON COLUMN pathway_modules.removed_at IS 'When set, module is hidden from admin working list; kept until republish drops it from snapshot (V2-D-pre).';
COMMENT ON COLUMN pathway_phases.removed_at IS 'When set, phase is hidden from admin working list; kept until republish cleanup (V2-D-pre).';

-- Replace full UNIQUE(phase_id, position) with partial unique so tombstones do not block positions.
ALTER TABLE pathway_modules
  DROP CONSTRAINT IF EXISTS pathway_modules_phase_position_unique;

CREATE UNIQUE INDEX pathway_modules_phase_position_active_unique
  ON pathway_modules (phase_id, position)
  WHERE removed_at IS NULL;

ALTER TABLE pathway_phases
  DROP CONSTRAINT IF EXISTS pathway_phases_pathway_id_position_key;

CREATE UNIQUE INDEX pathway_phases_pathway_position_active_unique
  ON pathway_phases (pathway_id, position)
  WHERE removed_at IS NULL;

CREATE INDEX pathway_modules_removed_idx ON pathway_modules (pathway_id) WHERE removed_at IS NOT NULL;
CREATE INDEX pathway_phases_removed_idx ON pathway_phases (pathway_id) WHERE removed_at IS NOT NULL;

ALTER TABLE pathways
  ADD COLUMN published_structure jsonb;

COMMENT ON COLUMN pathways.published_structure IS 'Frozen phase+module structure for published pathways (V2-D-pre). Learner UI reads this; admin edits live rows.';

-- Backfill snapshot for already-published pathways from current live structure.
UPDATE pathways p
SET published_structure = sub.doc
FROM (
  SELECT
    pw.id AS pathway_id,
    jsonb_build_object(
      'version',
      1,
      'phases',
      COALESCE(
        (
          SELECT jsonb_agg(
                   jsonb_build_object(
                     'id',
                     ph.id,
                     'position',
                     ph.position,
                     'title',
                     ph.title,
                     'description',
                     ph.description
                   )
                   ORDER BY
                     ph.position
                 )
          FROM pathway_phases ph
          WHERE ph.pathway_id = pw.id
            AND ph.removed_at IS NULL
        ),
        '[]'::jsonb
      ),
      'modules',
      COALESCE(
        (
          SELECT jsonb_agg(
                   jsonb_build_object(
                     'id',
                     m.id,
                     'phase_id',
                     m.phase_id,
                     'position',
                     m.position,
                     'module_type',
                     m.module_type,
                     'title',
                     m.title,
                     'context_markdown',
                     m.context_markdown,
                     'course_id',
                     m.course_id,
                     'quiz_id',
                     m.quiz_id,
                     'flashcard_deck_id',
                     m.flashcard_deck_id,
                     'blog_post_id',
                     m.blog_post_id,
                     'external_url',
                     m.external_url,
                     'external_label',
                     m.external_label
                   )
                   ORDER BY
                     ph2.position,
                     m.position
                 )
          FROM pathway_modules m
          JOIN pathway_phases ph2 ON ph2.id = m.phase_id
          WHERE m.pathway_id = pw.id
            AND m.removed_at IS NULL
            AND ph2.removed_at IS NULL
        ),
        '[]'::jsonb
      )
    ) AS doc
  FROM pathways pw
  WHERE pw.status = 'published'
) sub
WHERE p.id = sub.pathway_id;
