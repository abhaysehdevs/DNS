-- SQL MIGRATION: ADMIN PANEL ENHANCEMENTS
-- This script adds the necessary tables for Category Management and Storefront CMS.

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Homepage Banners Table for Store CMS
CREATE TABLE IF NOT EXISTS homepage_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link TEXT DEFAULT '/',
    button_text TEXT DEFAULT 'Shop Now',
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    platform TEXT DEFAULT 'all', -- 'all', 'desktop', 'mobile'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add Quantity field to Products if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;

-- 4. Enable RLS Policies (Simple Public Access for demo, restricted for production)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public View Categories" ON categories;
CREATE POLICY "Public View Categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin CRUD Categories" ON categories;
CREATE POLICY "Admin CRUD Categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public View Banners" ON homepage_banners;
CREATE POLICY "Public View Banners" ON homepage_banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin CRUD Banners" ON homepage_banners;
CREATE POLICY "Admin CRUD Banners" ON homepage_banners FOR ALL USING (auth.role() = 'authenticated');
