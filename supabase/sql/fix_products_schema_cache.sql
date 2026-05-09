-- =============================================================================
-- Alpine — fix missing `products` columns + inventory RPC + PostgREST cache
--
-- Run this entire script once in Supabase → SQL Editor if you see errors like:
--   "Could not find the 'track_stock' column of 'products' in the schema cache"
--   (same for price_oversize, variant_stock, quantity, etc.)
--
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE.
-- =============================================================================

-- Category constraint (idempotent)
alter table public.products drop constraint if exists products_category_check;
alter table public.products
  add constraint products_category_check
  check (category in ('Women', 'Men', 'Unisex', 'DTF'));

-- Columns that older DBs often lack (matches supabase/schema.sql)
alter table public.products add column if not exists colors jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists color_images jsonb not null default '{}'::jsonb;
alter table public.products add column if not exists fits jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists ordered_quantity integer not null default 0;
alter table public.products add column if not exists item_code text;
alter table public.products add column if not exists price_oversize numeric
  check (price_oversize is null or price_oversize >= 0);
alter table public.products add column if not exists quantity integer not null default 0;
alter table public.products add column if not exists track_stock boolean not null default false;
alter table public.products add column if not exists variant_stock jsonb not null default '{}'::jsonb;

-- Legacy: single `color` text → colors jsonb
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

-- Backfill fits from legacy `fit` when fits is empty
update public.products
set fits = jsonb_build_array(fit)
where fit is not null
  and (fits is null or fits = '[]'::jsonb or fits = 'null'::jsonb);

-- -----------------------------------------------------------------------------
-- Inventory RPC (variant_stock JSON + legacy quantity pool)
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
  p_track boolean;
  p_qty int;
  p_vs jsonb;
  v_key text;
  v_fit text;
  v_size text;
  v_color text;
  cur int;
  use_variants boolean;
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

    select p.track_stock, p.quantity, coalesce(p.variant_stock, '{}'::jsonb)
    into p_track, p_qty, p_vs
    from public.products p
    where p.id = pid
    for update;

    if not found then
      raise exception 'product_not_found';
    end if;

    if not p_track then
      update public.products
      set ordered_quantity = ordered_quantity + q, updated_at = now()
      where id = pid;
      get diagnostics n = row_count;
      if n <> 1 then
        raise exception 'product_not_found';
      end if;
      continue;
    end if;

    use_variants := p_vs is not null and p_vs <> '{}'::jsonb;

    if use_variants then
      v_fit := case
        when coalesce(trim(el->>'fit'), '') in ('Regular', 'Oversize') then trim(el->>'fit')
        else '_'
      end;
      v_size := case
        when coalesce(trim(el->>'size'), '') = '' then '_'
        else trim(el->>'size')
      end;
      v_color := case
        when coalesce(trim(el->>'color'), '') = '' then '_'
        else trim(el->>'color')
      end;
      v_key := v_fit || '|' || v_size || '|' || v_color;
      cur := coalesce((p_vs->>v_key)::int, 0);
      if cur < q then
        raise exception 'insufficient_stock';
      end if;
      update public.products
      set
        variant_stock = p_vs || jsonb_build_object(v_key, cur - q),
        ordered_quantity = ordered_quantity + q,
        updated_at = now()
      where id = pid;
      get diagnostics n = row_count;
      if n <> 1 then
        raise exception 'product_not_found';
      end if;
    else
      if p_qty < q then
        raise exception 'insufficient_stock';
      end if;
      update public.products
      set
        quantity = quantity - q,
        ordered_quantity = ordered_quantity + q,
        updated_at = now()
      where id = pid
        and quantity >= q;
      get diagnostics n = row_count;
      if n <> 1 then
        raise exception 'insufficient_stock';
      end if;
    end if;
  end loop;
end;
$$;

revoke all on function public.apply_order_inventory_changes (jsonb) from public;
grant execute on function public.apply_order_inventory_changes (jsonb) to service_role;

-- PostgREST: reload schema cache so the API sees new columns immediately
notify pgrst, 'reload schema';
