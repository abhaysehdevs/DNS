-- ==============================================================================
-- SQL MIGRATION: ADD SLUG AND SEO COLUMNS TO PRODUCTS
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. Add missing columns safely to public.products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Populate slugs for existing products that don't have one
UPDATE public.products 
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) || '-' || substring(id::text from 1 for 4)
WHERE slug IS NULL OR slug = '';

-- 3. Copy any existing meta_title / meta_description or specs SEO into the dedicated columns
UPDATE public.products
SET 
  seo_title = COALESCE(seo_title, meta_title, specifications->>'seo_title'),
  seo_description = COALESCE(seo_description, meta_description, specifications->>'seo_description'),
  seo_keywords = COALESCE(seo_keywords, specifications->>'seo_keywords')
WHERE seo_title IS NULL OR seo_description IS NULL OR seo_keywords IS NULL;

-- 4. Create an index on slug for fast URL lookups
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);

-- 5. Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
