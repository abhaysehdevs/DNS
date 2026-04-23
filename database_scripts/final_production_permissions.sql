-- 🚀 FINAL PRODUCTION PERMISSIONS FIX
-- This script ensures that all tables required for the storefront are publicly readable.
-- Run this in the Supabase SQL Editor to fix the "zero products" issue.

-- 1. Products Table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Products" ON products;
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);

-- 2. Categories Table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);

-- 3. Banners Table
ALTER TABLE homepage_banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Banners" ON homepage_banners;
CREATE POLICY "Public Read Banners" ON homepage_banners FOR SELECT USING (true);

-- 4. Announcements Table
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Announcements" ON announcements;
CREATE POLICY "Public Read Announcements" ON announcements FOR SELECT USING (true);

-- 5. Featured Collections Table
ALTER TABLE featured_collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Collections" ON featured_collections;
CREATE POLICY "Public Read Collections" ON featured_collections FOR SELECT USING (true);

-- 6. Store Settings (If exists)
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'store_settings') THEN
        ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Read Settings" ON store_settings;
        CREATE POLICY "Public Read Settings" ON store_settings FOR SELECT USING (true);
    END IF;
END $$;
