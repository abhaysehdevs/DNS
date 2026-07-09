-- Add SEO metadata fields to products table for professional search engine visibility
alter table public.products 
add column if not exists seo_title text,
add column if not exists seo_description text,
add column if not exists seo_keywords text;
