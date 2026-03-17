-- 1. Add item_code text null to the products table
alter table public.products
add column item_code text null;

-- 2. Add image text null to the categories table
alter table public.categories
add column image text null;
