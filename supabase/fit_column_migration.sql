-- Add fit column for filter-only categories (Oversize, Regular). Not in nav.
alter table public.products
  add column if not exists fit text check (fit is null or fit in ('Oversize', 'Regular'));
