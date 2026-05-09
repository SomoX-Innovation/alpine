alter table public.products add column if not exists variant_stock jsonb not null default '{}'::jsonb;

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

notify pgrst, 'reload schema';
