-- 005_tag_normalization.sql
-- Add normalized lowercase column to blog_tags for canonical comparison.
-- Add 30-char CHECK constraint on tag names.
--
-- Migration is idempotent: if a tag's lowercase form duplicates an existing
-- one, duplicates are removed and blog_post_tags references are remapped to
-- the canonical (oldest) row.

-- Step 1: Add the normalized column (nullable initially so we can populate)
ALTER TABLE blog_tags ADD COLUMN IF NOT EXISTS name_lower text;

-- Step 2: Populate name_lower from existing name values
UPDATE blog_tags
SET name_lower = lower(trim(name))
WHERE name_lower IS NULL;

-- Step 3: Detect and merge duplicate canonical forms before adding the unique constraint
DO $$
DECLARE
  dup_record RECORD;
  canonical_id uuid;
BEGIN
  FOR dup_record IN
    SELECT name_lower
    FROM blog_tags
    GROUP BY name_lower
    HAVING COUNT(*) > 1
  LOOP
    -- Find canonical (oldest) tag for this name_lower
    SELECT id INTO canonical_id
    FROM blog_tags
    WHERE name_lower = dup_record.name_lower
    ORDER BY created_at ASC NULLS LAST, id ASC
    LIMIT 1;

    -- Remap all tag references from duplicates to canonical
    UPDATE blog_post_tags
    SET tag_id = canonical_id
    WHERE tag_id IN (
      SELECT id FROM blog_tags
      WHERE name_lower = dup_record.name_lower
        AND id != canonical_id
    );

    -- Delete duplicate tags
    DELETE FROM blog_tags
    WHERE name_lower = dup_record.name_lower
      AND id != canonical_id;
  END LOOP;
END $$;

-- Step 4: Make name_lower NOT NULL and add unique index
ALTER TABLE blog_tags ALTER COLUMN name_lower SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS blog_tags_name_lower_key ON blog_tags(name_lower);

-- Step 5: Add 30-char CHECK constraint on name (also covers name_lower since it's derived)
ALTER TABLE blog_tags
  DROP CONSTRAINT IF EXISTS blog_tags_name_length_check;
ALTER TABLE blog_tags ADD CONSTRAINT blog_tags_name_length_check
  CHECK (char_length(name) <= 30 AND char_length(trim(name)) > 0);

-- Step 6: Trigger to auto-populate name_lower on insert/update
CREATE OR REPLACE FUNCTION blog_tags_set_name_lower() RETURNS trigger AS $$
BEGIN
  NEW.name_lower := lower(trim(NEW.name));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_tags_normalize_name_trigger ON blog_tags;
CREATE TRIGGER blog_tags_normalize_name_trigger
  BEFORE INSERT OR UPDATE OF name ON blog_tags
  FOR EACH ROW
  EXECUTE FUNCTION blog_tags_set_name_lower();

COMMENT ON COLUMN blog_tags.name_lower IS
  'Normalized (lowercase, trimmed) form of name. Used for uniqueness checks and similarity matching. Auto-populated via trigger.';

