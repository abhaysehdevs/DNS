-- Add gallery and group_id columns to products table if they don't exist
alter table public.products 
add column if not exists gallery jsonb default '[]'::jsonb,
add column if not exists group_id text,
add column if not exists variant_attributes jsonb default '{}'::jsonb;

-- Ensure RLS allows updates to these columns
-- (Usually standard update policy covers all columns, but good to be sure policy exists)
create policy "Admins can update products"
on public.products
for update
using (auth.uid() in (select id from public.profiles where role = 'admin'))
with check (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Admins can insert products"
on public.products
for insert
with check (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Admins can delete products"
on public.products
for delete
using (auth.uid() in (select id from public.profiles where role = 'admin'));
