-- Shiprocket Integration Setup

-- 1. Add Shiprocket Columns to Orders Table
alter table public.orders
add column if not exists shiprocket_order_id text,
add column if not exists shiprocket_shipment_id text,
add column if not exists awb_code text,
add column if not exists courier_company_id text,
add column if not exists courier_name text;

-- 2. Add Index for faster searching by shipment ID
create index if not exists idx_orders_shiprocket_id on public.orders(shiprocket_order_id);
create index if not exists idx_orders_awb on public.orders(awb_code);
