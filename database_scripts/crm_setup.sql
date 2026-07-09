-- SQL MIGRATION: CRM DATABASE TABLES SETUP
-- Create customer_profiles table for CRM manual customer records
create table if not exists public.customer_profiles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  phone text,
  type text default 'Retail' check (type in ('Retail', 'Wholesale')),
  status text default 'Lead' check (status in ('Lead', 'Active', 'Inactive', 'Blocked')),
  tags text[] default '{}'::text[],
  notes text,
  created_at timestamptz default now()
);

-- Create customer_quotes table for CRM customer quotes tracking
create table if not exists public.customer_quotes (
  id uuid default gen_random_uuid() primary key,
  customer_id text not null, -- can be email or phone or ID
  customer_name text not null,
  product_name text not null,
  quoted_price numeric not null,
  notes text,
  date timestamptz default now()
);

-- Create customer_activities table for CRM customer interactions log
create table if not exists public.customer_activities (
  id uuid default gen_random_uuid() primary key,
  customer_id text not null,
  type text not null check (type in ('Call', 'Email', 'Meeting', 'Note', 'Order')),
  summary text not null,
  details text,
  date timestamptz default now()
);

-- Enable RLS
alter table public.customer_profiles enable row level security;
alter table public.customer_quotes enable row level security;
alter table public.customer_activities enable row level security;

-- RLS Policies
create policy "Allow read access to authenticated users" 
  on public.customer_profiles for select using (true);
create policy "Allow all write access to authenticated users" 
  on public.customer_profiles for all using (true);

create policy "Allow read access to authenticated users" 
  on public.customer_quotes for select using (true);
create policy "Allow all write access to authenticated users" 
  on public.customer_quotes for all using (true);

create policy "Allow read access to authenticated users" 
  on public.customer_activities for select using (true);
create policy "Allow all write access to authenticated users" 
  on public.customer_activities for all using (true);
