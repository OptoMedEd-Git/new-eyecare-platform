-- 018_flashcards_images.sql
-- Add optional image support to flashcards. Mirrors quiz_questions (image_url / image_attribution as nullable text).
-- image_url: URL to the uploaded image (typically Supabase Storage public URL from blog-images bucket)
-- image_attribution: optional photographer/source credit text

ALTER TABLE flashcards
  ADD COLUMN image_url text,
  ADD COLUMN image_attribution text;

COMMENT ON COLUMN flashcards.image_url IS 'Optional image displayed alongside the front prompt. Typically a clinical diagram, OCT scan, or anatomical reference.';
COMMENT ON COLUMN flashcards.image_attribution IS 'Optional credit/source text shown with the image.';
