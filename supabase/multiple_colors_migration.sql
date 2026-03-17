-- 1. Add the new colors column as a jsonb array
alter table public.products
add column colors jsonb not null default '[]';

-- 2. Migrate existing color text data to the new colors array
update public.products
set colors = json_build_array(color)
where color is not null and color != '';

-- 3. Drop the old color column
alter table public.products
drop column color;
