-- 007_blog_view_count.sql
-- Add view_count to blog_posts for tracking how many times a published post has been viewed.
-- Incremented server-side on /blog/[slug] page renders.
--
-- NOTE: Some environments may already have view_count from earlier migrations.
-- This migration is intentionally idempotent.
--
-- TODO (future): deduplicate views by user_id (for logged-in users) and by session/IP
-- (for anonymous viewers) to avoid counting reloads as separate views.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN blog_posts.view_count IS
  'Total view count for this post. Incremented on each public render of /blog/[slug].';

-- Create an RPC function for atomic increment to avoid race conditions
CREATE OR REPLACE FUNCTION increment_blog_post_view_count(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE blog_posts SET view_count = view_count + 1 WHERE id = post_id;
$$;

-- Grant execute to authenticated and anon (public blog is viewable without login)
GRANT EXECUTE ON FUNCTION increment_blog_post_view_count(uuid) TO anon, authenticated;

