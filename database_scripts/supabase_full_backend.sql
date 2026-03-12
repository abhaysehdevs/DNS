-- 1. PROFILES Table (Extends Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role text default 'customer', -- 'customer' or 'admin'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- Profile Policies
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can insert their own profile" 
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. REVIEWS Table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id text not null, -- Using text ID from static data or DB
  user_id uuid references auth.users on delete set null,
  user_name text, -- Cache name in case user is deleted or guest
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS for Reviews
alter table public.reviews enable row level security;

-- Review Policies
create policy "Reviews are viewable by everyone" 
  on public.reviews for select using (true);

create policy "Authenticated users can create reviews" 
  on public.reviews for insert with check (auth.role() = 'authenticated');

create policy "Users can delete their own reviews" 
  on public.reviews for delete using (auth.uid() = user_id);


-- 3. WISHLIST Table
create table if not exists public.wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id text not null,
  created_at timestamptz default now(),
  unique(user_id, product_id) -- Prevent duplicates
);

-- Enable RLS for Wishlist
alter table public.wishlist enable row level security;

-- Wishlist Policies
create policy "Users can view their own wishlist" 
  on public.wishlist for select using (auth.uid() = user_id);

create policy "Users can insert into their own wishlist" 
  on public.wishlist for insert with check (auth.uid() = user_id);

create policy "Users can delete from their own wishlist" 
  on public.wishlist for delete using (auth.uid() = user_id);


-- 4. ADDRESSES Table (For Checkout)
create table if not exists public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text default 'shipping', -- 'shipping' or 'billing'
  full_name text,
  phone text,
  line1 text,
  line2 text,
  city text,
  state text,
  pincode text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS for Addresses
alter table public.addresses enable row level security;

-- Address Policies
create policy "Users can manage their own addresses" 
  on public.addresses for all using (auth.uid() = user_id);


-- 5. INQUIRIES Table (For Wholesale "Get Quote")
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null, -- Optional, can be guest
  product_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  message text,
  status text default 'pending', -- pending, contacted, closed
  created_at timestamptz default now()
);

-- Enable RLS for Inquiries
alter table public.inquiries enable row level security;

-- Inquiry Policies
create policy "Admins can view all inquiries" 
  on public.inquiries for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can view their own inquiries" 
  on public.inquiries for select using (auth.uid() = user_id);

create policy "Anyone can insert inquiries" 
  on public.inquiries for insert with check (true);


-- 6. CART ITEMS Table
create table if not exists public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id text not null,
  quantity integer default 1 check (quantity > 0),
  variant_id text, 
  variant_attributes jsonb,
  mode text default 'retail', -- 'retail' or 'wholesale'
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, product_id, variant_id, mode) -- Unique item per variant/mode
);

-- Enable RLS for Cart Items
alter table public.cart_items enable row level security;

-- Cart Policies
create policy "Users can manage their own cart" 
  on public.cart_items for all using (auth.uid() = user_id);
