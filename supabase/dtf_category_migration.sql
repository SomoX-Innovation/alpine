-- Add DTF as a product category and to the categories table

-- 1. Allow DTF in products.category
alter table public.products drop constraint if exists products_category_check;
alter table public.products add constraint products_category_check
  check (category in ('Women', 'Men', 'Unisex', 'DTF'));

-- 2. Insert DTF into categories so it appears in admin product forms
insert into public.categories (name, slug)
values ('DTF', 'dtf')
on conflict (slug) do nothing;
