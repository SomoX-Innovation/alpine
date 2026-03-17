-- Add quantity column for product stock.
alter table public.products
  add column if not exists quantity integer not null default 0 check (quantity >= 0);
