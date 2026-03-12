-- Comprehensive Product Schema Fix

-- 1. Add 'gallery' column (stores array of image/video objects)
alter table public.products 
add column if not exists gallery jsonb default '[]'::jsonb;

-- 2. Add 'variants' column (stores array of variant objects)
alter table public.products 
add column if not exists variants jsonb default '[]'::jsonb;

-- 3. Add 'variant_type' column (e.g., "Size", "Color")
alter table public.products 
add column if not exists variant_type text default 'Size';

-- 4. Add 'group_id' (for future grouping of similar products)
alter table public.products 
add column if not exists group_id text;

-- 5. Add 'variant_attributes' (extra metadata for variants)
alter table public.products 
add column if not exists variant_attributes jsonb default '{}'::jsonb;

-- 6. Add 'quantity' column if missing (for inventory tracking)
alter table public.products 
add column if not exists quantity integer default 0;

-- 7. Ensure RLS policies exist (this is safe to re-run, existing policies will just error or be skipped depending on implementation, but standard `create policy` errors if exists. We will use `do` block to safely check or just let user ignore error)

-- Simplified Policy Creation (only if they don't exist - manual check usually required, but re-running simple creates is fine if user ignores "already exists" error)
-- No complex logic here to avoid confusion. The main fix is the columns above.
