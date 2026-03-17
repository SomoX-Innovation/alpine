-- 1. Create the colors table
create table if not exists public.colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Insert initial colors to avoid breaking existing frontend loops/filters
insert into public.colors (name, slug)
values 
  ('Black', 'black'),
  ('White', 'white'),
  ('Gray', 'gray'),
  ('Red', 'red'),
  ('Blue', 'blue')
on conflict (slug) do nothing;
