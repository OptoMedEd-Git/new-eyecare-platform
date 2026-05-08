-- 003_blog_image_attribution.sql
-- Add image attribution field to blog_posts.
-- Nullable for existing rows; required at publish time via application logic
-- (matches the same pattern as `description`).
--
-- TODO (future): replace this single text field with structured attribution
-- columns (type: 'original'|'sourced', author, title, source_url, publisher,
-- date) and a server endpoint that parses Open Graph metadata from URLs to
-- auto-generate citations. See conversation context for full design.

ALTER TABLE blog_posts
  ADD COLUMN cover_image_attribution text;

COMMENT ON COLUMN blog_posts.cover_image_attribution IS
  'Plain-text attribution for the cover image. Required at publish time. Free-form for now; will be structured in a future migration.';

