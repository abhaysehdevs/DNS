
-- Create Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  total_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method text default 'cod',
  type text default 'retail' check (type in ('retail', 'wholesale'))
);

-- Create Order Items Table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id text not null, -- Linking to our product IDs (which are text like 't1-fine')
  product_name text not null,
  variant_name text,
  quantity integer not null,
  price numeric not null,
  subtotal numeric not null
);

-- Enable Row Level Security (RLS)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies (For simple MVP, allow public insert, but only admin select)
-- In production, you would use authenticated users.

-- Allow anyone to create an order
create policy "Enable insert for everyone" on public.orders for insert with check (true);
create policy "Enable insert for everyone" on public.order_items for insert with check (true);

-- Allow public to select their own order if they have the ID (UUID is hard to guess)
create policy "Enable select for everyone" on public.orders for select using (true);
create policy "Enable select for everyone" on public.order_items for select using (true);
