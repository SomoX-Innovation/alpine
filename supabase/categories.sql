-- 1. Create the categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Insert initial categories to avoid breaking existing frontend loops/filters
insert into public.categories (name, slug)
values 
  ('Women', 'women'),
  ('Men', 'men'),
  ('Unisex', 'unisex'),
  ('DTF', 'dtf')
on conflict (slug) do nothing;

-- 3. Remove the old strict check constraint from the products table
-- The constraint was likely named `products_category_check` by Supabase.
-- If it fails because the constraint name is different, you may need to find the exact name.
alter table public.products drop constraint if exists products_category_check;
