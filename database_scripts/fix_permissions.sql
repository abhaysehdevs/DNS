-- 1. Enable Update and Delete for Products (for everyone/anon)
create policy "Enable update for all" on products for update using (true);
create policy "Enable delete for all" on products for delete using (true);

-- 2. Enable Update for Orders (to change status)
create policy "Enable update for all" on orders for update using (true);

-- 3. Create Settings Table
create table store_settings (
  id integer primary key generated always as identity,
  currency text default 'INR',
  notifications_enabled boolean default true,
  admin_email text default 'admin@dinanath.com',
  admin_name text default 'Admin'
);

-- 4. Insert default settings (only 1 row needed)
insert into store_settings (currency, notifications_enabled, admin_email) values ('INR', true, 'admin@dinanath.com');

-- 5. Enable Access to Settings
alter table store_settings enable row level security;
create policy "Enable access to settings" on store_settings for all using (true);
