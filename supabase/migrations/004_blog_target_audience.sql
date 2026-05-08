-- 004_blog_target_audience.sql
-- Add target_audience to blog_posts.
-- Optional at draft, optional at publish (informational metadata only).

CREATE TYPE blog_target_audience AS ENUM (
  'student',
  'resident',
  'practicing',
  'all'
);

ALTER TABLE blog_posts
  ADD COLUMN target_audience blog_target_audience;

COMMENT ON COLUMN blog_posts.target_audience IS
  'Intended audience level for this article. Optional. Helps readers and recommendation systems route content appropriately.';

