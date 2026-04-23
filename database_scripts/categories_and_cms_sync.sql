-- 0. Ensure UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT (CASE WHEN current_setting('server_version_num')::int >= 130000 THEN gen_random_uuid() ELSE uuid_generate_v4() END),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure UNIQUE constraints exist (Required for ON CONFLICT)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key') THEN
        ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_key') THEN
        ALTER TABLE categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 2. Migrate existing categories from products table
INSERT INTO categories (name, slug, display_order)
SELECT DISTINCT category, LOWER(REPLACE(category, ' ', '-')), 0
FROM products
WHERE category IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- 3. Add category_id to products for better relational integrity (Optional but recommended)
-- For now, we will keep the 'category' string in products to avoid breaking existing code,
-- but we will ensure the 'categories' table is the source of truth for the Admin Panel.

-- 4. Create a View for better CMS insights (Top Categories)
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    c.id,
    c.name,
    COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category = c.name
GROUP BY c.id, c.name;

-- 5. Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 7. Homepage Banners Table
CREATE TABLE IF NOT EXISTS homepage_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link TEXT DEFAULT '/',
    button_text TEXT DEFAULT 'Shop Now',
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    platform TEXT DEFAULT 'all', -- 'all', 'desktop', 'mobile'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    background_color TEXT DEFAULT '#000000',
    text_color TEXT DEFAULT '#ffffff',
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Featured Collections Table
CREATE TABLE IF NOT EXISTS featured_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    query TEXT, -- Filter query (e.g. category=Tools)
    display_limit INTEGER DEFAULT 8,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for new tables
ALTER TABLE homepage_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_collections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Read Banners" ON homepage_banners FOR SELECT USING (true);
CREATE POLICY "Admin All Banners" ON homepage_banners FOR ALL USING (true);

CREATE POLICY "Public Read Announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admin All Announcements" ON announcements FOR ALL USING (true);

CREATE POLICY "Public Read Collections" ON featured_collections FOR SELECT USING (true);
CREATE POLICY "Admin All Collections" ON featured_collections FOR ALL USING (true);
