-- Multiple fits per product (Regular / Oversize). Legacy `fit` column kept for compatibility.
alter table public.products
add column if not exists fits jsonb not null default '[]'::jsonb;

-- Backfill from single fit column where fits is empty
update public.products
set fits = jsonb_build_array(fit)
where fit is not null
  and (fits is null or fits = '[]'::jsonb);
