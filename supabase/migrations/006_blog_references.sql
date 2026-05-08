-- 006_blog_references.sql
-- Add references column to blog_posts. Stores an array of { text, url? } objects.
-- Optional metadata; not required to publish. Empty array is the default.

ALTER TABLE blog_posts
  ADD COLUMN "references" jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN blog_posts."references" IS
  'Array of reference objects: [{ text: string, url?: string }]. Order in array = display order.';

-- Sanity-check constraint: must always be a JSON array
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_references_is_array
  CHECK (jsonb_typeof("references") = 'array');

