-- =============================================================================
-- Alpine — single Supabase schema (run in SQL Editor on a new project, or review
-- sections for incremental fixes). Uses IF NOT EXISTS / idempotent patterns where possible.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Categories & colors (admin pickers / filters)
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.categories (name, slug)
values
  ('Women', 'women'),
  ('Men', 'men'),
  ('Unisex', 'unisex'),
  ('DTF', 'dtf')
on conflict (slug) do nothing;

create table if not exists public.colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.colors (name, slug)
values
  ('Black', 'black'),
  ('White', 'white'),
  ('Gray', 'gray'),
  ('Red', 'red'),
  ('Blue', 'blue')
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Products
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric not null check (price >= 0),
  compare_at_price numeric check (compare_at_price is null or compare_at_price >= 0),
  category text not null,
  badge text check (badge is null or badge in ('New', 'Sale')),
  fit text check (fit is null or fit in ('Oversize', 'Regular')),
  fits jsonb not null default '[]'::jsonb,
  item_code text null,
  sizes jsonb not null default '["S","M","L","XL","XXL"]'::jsonb,
  quantity integer not null default 0 check (quantity >= 0),
  ordered_quantity integer not null default 0 check (ordered_quantity >= 0),
  image text not null default '',
  images jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  color_images jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products drop constraint if exists products_category_check;
alter table public.products
  add constraint products_category_check
  check (category in ('Women', 'Men', 'Unisex', 'DTF'));

-- Existing databases may have an old `products` row shape (CREATE TABLE was skipped): add columns first.
alter table public.products add column if not exists colors jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists color_images jsonb not null default '{}'::jsonb;
alter table public.products add column if not exists fits jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists ordered_quantity integer not null default 0;
alter table public.products add column if not exists item_code text;
alter table public.products add column if not exists quantity integer not null default 0;

-- Legacy: migrate old `color` text column into `colors` jsonb if it still exists
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'color'
  ) then
    update public.products
    set colors = jsonb_build_array(color)
    where color is not null and trim(color) <> ''
      and (colors is null or colors = '[]'::jsonb);
    alter table public.products drop column if exists color;
  end if;
end $$;

-- Backfill fits from legacy single `fit` when fits is empty
update public.products
set fits = jsonb_build_array(fit)
where fit is not null
  and (fits is null or fits = '[]'::jsonb or fits = 'null'::jsonb);

create index if not exists products_slug on public.products (slug);
create index if not exists products_published on public.products (published);
create index if not exists products_category on public.products (category);

-- -----------------------------------------------------------------------------
-- Orders (checkout)
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')
  ),
  customer_email text not null,
  customer_name text not null,
  user_id uuid references auth.users (id) on delete set null,
  shipping_address jsonb not null default '{}'::jsonb,
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric not null,
  shipping_cost numeric not null,
  total numeric not null,
  payment_method text not null default 'card' check (payment_method in ('card', 'cod')),
  tracking_code text,
  tracking_carrier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_order_number on public.orders (order_number);
create index if not exists orders_customer_email on public.orders (customer_email);
create index if not exists orders_created_at on public.orders (created_at desc);
create index if not exists orders_user_id on public.orders (user_id);

-- -----------------------------------------------------------------------------
-- Customized DTF orders
-- -----------------------------------------------------------------------------
create table if not exists public.customized_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'completed', 'cancelled')
  ),
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null default '',
  tshirt_type text not null check (tshirt_type in ('Regular', 'Oversize')),
  print_size text not null check (print_size in ('A4', 'A3')),
  placements jsonb not null default '[]'::jsonb,
  design_urls jsonb not null default '{}'::jsonb,
  size_quantities jsonb not null default '{}'::jsonb,
  quantity integer not null default 0 check (quantity >= 0),
  notes text not null default '',
  total numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customized_orders_created_at on public.customized_orders (created_at desc);
create index if not exists customized_orders_email on public.customized_orders (customer_email);

-- -----------------------------------------------------------------------------
-- Inventory RPC (checkout: decrement stock + increment ordered_quantity, atomic)
-- -----------------------------------------------------------------------------
drop function if exists public.increment_product_ordered_quantity (uuid, int);

create or replace function public.apply_order_inventory_changes (p_lines jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  el jsonb;
  n int;
  pid uuid;
  q int;
begin
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    raise exception 'invalid_inventory_payload';
  end if;
  for el in select * from jsonb_array_elements(p_lines)
  loop
    pid := (el->>'product_id')::uuid;
    q := coalesce((el->>'qty')::int, 0);
    if q <= 0 then
      continue;
    end if;
    update public.products
    set
      ordered_quantity = ordered_quantity + q,
      quantity = quantity - q,
      updated_at = now()
    where id = pid
      and quantity >= q;
    get diagnostics n = row_count;
    if n <> 1 then
      raise exception 'insufficient_stock';
    end if;
  end loop;
end;
$$;

revoke all on function public.apply_order_inventory_changes (jsonb) from public;
grant execute on function public.apply_order_inventory_changes (jsonb) to service_role;

-- -----------------------------------------------------------------------------
-- Misc
-- -----------------------------------------------------------------------------
create sequence if not exists order_number_seq start 1001;

-- -----------------------------------------------------------------------------
-- Storage: product images bucket
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product-images" on storage.objects;
create policy "Public read product-images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Allow uploads product-images" on storage.objects;
create policy "Allow uploads product-images"
on storage.objects for insert
with check (bucket_id = 'product-images');

drop policy if exists "Allow update product-images" on storage.objects;
create policy "Allow update product-images"
on storage.objects for update
using (bucket_id = 'product-images');

drop policy if exists "Allow delete product-images" on storage.objects;
create policy "Allow delete product-images"
on storage.objects for delete
using (bucket_id = 'product-images');

-- -----------------------------------------------------------------------------
-- Admin dashboard: auth user IDs allowed to access /admin
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is 'Users allowed to access /admin; checked in app middleware.';

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self"
on public.admin_users for select
to authenticated
using (auth.uid() = user_id);

grant select on public.admin_users to authenticated;

insert into public.admin_users (user_id)
values ('bbdb402b-0526-44f1-91df-c0e65747bf90'::uuid)
on conflict (user_id) do nothing;

-- -----------------------------------------------------------------------------
-- Customer profile & default shipping (account page: Profile + Addresses)
-- -----------------------------------------------------------------------------
create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  address_line text not null default '',
  city text not null default '',
  postal_code text not null default '',
  country text not null default 'Sri Lanka',
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

drop policy if exists "customer_profiles_select_own" on public.customer_profiles;
create policy "customer_profiles_select_own"
on public.customer_profiles for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "customer_profiles_insert_own" on public.customer_profiles;
create policy "customer_profiles_insert_own"
on public.customer_profiles for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "customer_profiles_update_own" on public.customer_profiles;
create policy "customer_profiles_update_own"
on public.customer_profiles for update
to authenticated
using (auth.uid() = user_id);

grant select, insert, update on public.customer_profiles to authenticated;

-- -----------------------------------------------------------------------------
-- Site settings (hero, FAQ JSON, etc.)
-- -----------------------------------------------------------------------------
create table if not exists public.settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.settings (key, value)
values
  ('hero_image', '/1771954158424.jpg.jpeg'),
  (
    'faq_json',
    '[{"q": "What is your return policy?", "a": "You can return unworn, unwashed items with tags attached within 7 days of delivery. We''ll refund the purchase price to your original payment method. Sale items may have different terms."}]'
  )
on conflict (key) do nothing;
