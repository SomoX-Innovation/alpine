-- Run this in Supabase SQL Editor to create tables and storage.

-- Products (for admin CRUD and storefront)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric not null check (price >= 0),
  compare_at_price numeric check (compare_at_price is null or compare_at_price >= 0),
  category text not null check (category in ('Women', 'Men', 'Unisex', 'DTF')),
  badge text check (badge is null or badge in ('New', 'Sale')),
  fit text check (fit is null or fit in ('Oversize', 'Regular')),
  color text,
  sizes jsonb not null default '["S","M","L","XL","XXL"]',
  quantity integer not null default 0 check (quantity >= 0),
  image text not null default '',
  images jsonb not null default '[]',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_slug on public.products(slug);
create index if not exists products_published on public.products(published);
create index if not exists products_category on public.products(category);

-- Orders (from checkout, for admin and track-order)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  customer_email text not null,
  customer_name text not null,
  shipping_address jsonb not null default '{}',
  line_items jsonb not null default '[]',
  subtotal numeric not null,
  shipping_cost numeric not null,
  total numeric not null,
  tracking_code text,
  tracking_carrier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_order_number on public.orders(order_number);
create index if not exists orders_customer_email on public.orders(customer_email);
create index if not exists orders_created_at on public.orders(created_at desc);

-- Order number sequence (optional; can generate in app with timestamp)
create sequence if not exists order_number_seq start 1001;

-- Storage bucket for product images (create in Dashboard > Storage: bucket name "product-images", public)
-- Or via SQL:
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow public read for product-images
create policy "Public read product-images"
on storage.objects for select
using (bucket_id = 'product-images');

-- Allow anon/service to upload (for Server Actions using anon or service key)
create policy "Allow uploads product-images"
on storage.objects for insert
with check (bucket_id = 'product-images');

create policy "Allow update product-images"
on storage.objects for update
using (bucket_id = 'product-images');

create policy "Allow delete product-images"
on storage.objects for delete
using (bucket_id = 'product-images');

-- Settings (for hero image, FAQ, etc.)
create table if not exists public.settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Default settings
insert into public.settings (key, value) 
values 
  ('hero_image', '/1771954158424.jpg.jpeg'), 
  ('faq_json', '[{"q": "What is your return policy?", "a": "You can return unworn, unwashed items with tags attached within 30 days of delivery. We''ll refund the purchase price to your original payment method. Sale items may have different terms."}]')
on conflict (key) do nothing;
