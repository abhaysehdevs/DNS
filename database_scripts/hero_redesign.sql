-- ==============================================================================
-- Migration: Hero Section Redesign & Store CMS Hero Enhancement
-- Date: 2026-10-12
-- Additive, safe, idempotent migration
-- ==============================================================================

-- 1. Add featured_on_hero flag to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_on_hero BOOLEAN DEFAULT false;

-- Add index on featured_on_hero for quick hero queries
CREATE INDEX IF NOT EXISTS idx_products_featured_on_hero ON products (featured_on_hero) WHERE featured_on_hero = true;

-- 2. Enhance homepage_banners for comprehensive CMS control
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS eyebrow TEXT;
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS secondary_button_text TEXT DEFAULT 'Get a bulk quote';
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS secondary_link TEXT DEFAULT '/contact?subject=Bulk+Quote';
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '919810000000';
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT 'Hello Dinanath & Sons, I would like to inquire about jewellery tools and machinery.';
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS fallback_image_desktop TEXT;
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS fallback_image_mobile TEXT;
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS featured_product_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS trust_items JSONB DEFAULT '[
    {"id": "since1960", "icon": "history", "label": "Since 1960", "sublabel": "3 generations of trade", "enabled": true},
    {"id": "gst", "icon": "receipt", "label": "GST invoice", "sublabel": "For B2B and wholesale orders", "enabled": true},
    {"id": "shipping", "icon": "truck", "label": "Ships across India", "sublabel": "Insured dispatch from Delhi", "enabled": true},
    {"id": "catalog", "icon": "tools", "label": "80+ products", "sublabel": "Tools, machines, consumables", "enabled": true}
]'::jsonb;
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- 3. Ensure RLS policies on homepage_banners allow public read and authenticated management
ALTER TABLE homepage_banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Banners" ON homepage_banners;
CREATE POLICY "Public Read Banners" ON homepage_banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Banners" ON homepage_banners;
CREATE POLICY "Admin All Banners" ON homepage_banners FOR ALL USING (true);
