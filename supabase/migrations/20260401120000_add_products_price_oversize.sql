-- Optional oversize unit price (Regular stays on products.price).
alter table public.products
  add column if not exists price_oversize numeric
  check (price_oversize is null or price_oversize >= 0);

-- Refresh PostgREST schema cache so the API sees the new column immediately.
notify pgrst, 'reload schema';
