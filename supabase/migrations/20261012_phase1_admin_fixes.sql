-- ==============================================================================
-- PHASE 1 MIGRATION: ADMIN RECOVERY, SEO METADATA, SAFETY & SESSIONS
-- Dinanath & Sons Admin Panel Upgrade
-- ==============================================================================

-- 1. Products: Add missing SEO, slug, canonical, og_image, noindex and soft-delete columns
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS og_image_url TEXT,
ADD COLUMN IF NOT EXISTS noindex BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_price_on_request BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Populate missing product slugs safely
UPDATE public.products 
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) || '-' || substring(id::text from 1 for 4)
WHERE (slug IS NULL OR slug = '') AND (specifications->>'slug' IS NULL OR specifications->>'slug' = '');

UPDATE public.products
SET slug = specifications->>'slug'
WHERE (slug IS NULL OR slug = '') AND specifications->>'slug' IS NOT NULL;

-- 3. Backfill SEO columns from existing meta_title / meta_description or specifications jsonb
UPDATE public.products
SET 
  meta_title = COALESCE(meta_title, seo_title, specifications->>'seo_title', specifications->>'meta_title'),
  meta_description = COALESCE(meta_description, seo_description, specifications->>'seo_description', specifications->>'meta_description'),
  meta_keywords = COALESCE(meta_keywords, seo_keywords, specifications->>'seo_keywords'),
  seo_title = COALESCE(seo_title, meta_title, specifications->>'seo_title'),
  seo_description = COALESCE(seo_description, meta_description, specifications->>'seo_description'),
  seo_keywords = COALESCE(seo_keywords, meta_keywords, specifications->>'seo_keywords')
WHERE meta_title IS NULL OR meta_description IS NULL OR meta_keywords IS NULL;

-- 4. Create unique partial index on slug (ignores nulls and soft-deleted rows)
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx 
ON public.products (slug) 
WHERE slug IS NOT NULL AND deleted_at IS NULL;

-- 5. Categories: Add SEO, banner, order and soft-delete columns
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS og_image_url TEXT,
ADD COLUMN IF NOT EXISTS noindex BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banner_image TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Backfill category slug
UPDATE public.categories
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique_idx 
ON public.categories (slug) 
WHERE slug IS NOT NULL AND deleted_at IS NULL;

-- 6. Blog Posts: Add SEO and soft-delete columns
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS og_image_url TEXT,
ADD COLUMN IF NOT EXISTS noindex BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 7. Coupons: Add soft-delete column
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 8. Redirects Table (for 301 redirects when slugs change or products are merged)
CREATE TABLE IF NOT EXISTS public.redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_path TEXT NOT NULL UNIQUE,
  target_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS redirects_source_path_idx ON public.redirects (source_path);

-- Enable RLS on redirects
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'redirects' AND policyname = 'Allow public read redirects'
  ) THEN
    CREATE POLICY "Allow public read redirects" ON public.redirects FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'redirects' AND policyname = 'Allow all write redirects'
  ) THEN
    CREATE POLICY "Allow all write redirects" ON public.redirects FOR ALL USING (true);
  END IF;
END $$;

-- 9. Audit Logs Table (tracks who did what, when, before/after values, IP)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON public.audit_logs (resource_type, resource_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Allow admin access audit_logs'
  ) THEN
    CREATE POLICY "Allow admin access audit_logs" ON public.audit_logs FOR ALL USING (true);
  END IF;
END $$;

-- 10. Admin Sessions: Ensure full diagnostic columns exist
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  device_info TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  city TEXT,
  country TEXT,
  last_active TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE public.admin_sessions 
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_sessions' AND policyname = 'Allow all access to admin_sessions'
  ) THEN
    CREATE POLICY "Allow all access to admin_sessions" ON public.admin_sessions FOR ALL USING (true);
  END IF;
END $$;

-- 11. Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
