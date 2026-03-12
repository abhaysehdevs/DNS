-- 1. Create a new storage bucket for products
insert into storage.buckets (id, name, public)
values ('products', 'products', true);

-- 2. Enable RLS for the products bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "Authenticated Users Can Upload"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

create policy "Authenticated Users Can Update"
  on storage.objects for update
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

create policy "Authenticated Users Can Delete"
  on storage.objects for delete
  using ( bucket_id = 'products' and auth.role() = 'authenticated' );
