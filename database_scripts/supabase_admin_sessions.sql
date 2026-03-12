-- Create the admin_sessions table
create table if not exists public.admin_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  device_info text,
  ip_address text,
  last_active timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.admin_sessions enable row level security;

-- Policies
create policy "Users can view their own sessions"
  on public.admin_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.admin_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.admin_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on public.admin_sessions for delete
  using (auth.uid() = user_id);
