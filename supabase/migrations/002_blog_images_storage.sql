-- Migration 002: Blog images storage setup
-- Adds storage path tracking to blog_posts and configures RLS policies on the blog-images bucket.
-- The bucket itself must be created manually via Supabase dashboard before applying these policies.

-- =========================================================
-- 1. Add cover_image_path column to blog_posts
-- =========================================================

alter table public.blog_posts
  add column if not exists cover_image_path text;

comment on column public.blog_posts.cover_image_path is
  'Storage path within the blog-images bucket (e.g., "user-uuid/filename.jpg"). Used for deletion. NULL for posts using external URLs (Unsplash, etc).';

-- =========================================================
-- 2. RLS policies on storage.objects for blog-images bucket
-- =========================================================
-- Note: The bucket must exist before these policies take effect.
-- Create the bucket via Supabase dashboard: Storage > New Bucket > Name: blog-images, Public: true.

-- Drop existing policies for clean re-application (idempotent migration)
drop policy if exists "blog_images_public_read" on storage.objects;
drop policy if exists "blog_images_authoring_insert" on storage.objects;
drop policy if exists "blog_images_owner_update" on storage.objects;
drop policy if exists "blog_images_owner_delete" on storage.objects;
drop policy if exists "blog_images_admin_all" on storage.objects;

-- a) Public read: anyone can view files in blog-images
create policy "blog_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'blog-images');

-- b) Authoring insert: admins and contributors can upload to their own folder
-- Path structure: {user_id}/{filename}, so the first folder segment must equal auth.uid()::text
create policy "blog_images_authoring_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.get_user_role(auth.uid()) in ('admin', 'contributor')
);

-- c) Owner update: users can update objects in their own folder
create policy "blog_images_owner_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- d) Owner delete: users can delete objects in their own folder
create policy "blog_images_owner_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- e) Admin override: admins can update/delete any object (for moderation)
create policy "blog_images_admin_all"
on storage.objects for all
to authenticated
using (
  bucket_id = 'blog-images'
  and public.get_user_role(auth.uid()) = 'admin'
)
with check (
  bucket_id = 'blog-images'
  and public.get_user_role(auth.uid()) = 'admin'
);

-- =========================================================
-- DEPLOYMENT INSTRUCTIONS (run in this order)
-- =========================================================
-- Step 1: Create the bucket via Supabase Dashboard
--   1. Go to Storage in the Supabase dashboard
--   2. Click "New bucket"
--   3. Name: blog-images
--   4. Public bucket: TRUE (toggle on)
--   5. File size limit: 5 MB (5242880 bytes)
--   6. Allowed MIME types: image/jpeg, image/png, image/webp
--   7. Click Save
--
-- Step 2: Run this migration file in the Supabase SQL Editor
--   The policies will attach to the bucket created in Step 1.
--
-- Step 3: Verify
--   - Check Storage > Policies > blog-images: should see 5 policies
--   - Check Table Editor > blog_posts: should see new cover_image_path column
