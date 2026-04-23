-- SQL MIGRATION: PRODUCT SCHEMA UPGRADE (AMAZON-STYLE)
-- This script expands the products table with detailed fields for a robust e-commerce experience.

-- 1. Add detailed fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model_number TEXT,
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS weight TEXT,
ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{"length": "", "width": "", "height": ""}',
ADD COLUMN IF NOT EXISTS warranty_info TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 2. Ensure storage bucket exists for products (Run this in Supabase UI if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;

-- 3. Update RLS for storage (Run these in Supabase SQL editor)
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');
-- CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');
