-- Create site_settings table for persistent global site configuration
create table if not exists public.site_settings (
  key text primary key,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.site_settings enable row level security;

-- Policies
create policy "Allow read access to anyone" 
  on public.site_settings for select using (true);

create policy "Allow full control to admins" 
  on public.site_settings for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
