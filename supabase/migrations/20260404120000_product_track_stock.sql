alter table public.products add column if not exists track_stock boolean not null default false;

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
    update public.products p
    set
      ordered_quantity = p.ordered_quantity + q,
      quantity = case when p.track_stock then p.quantity - q else p.quantity end,
      updated_at = now()
    where p.id = pid
      and (not p.track_stock or p.quantity >= q);
    get diagnostics n = row_count;
    if n <> 1 then
      raise exception 'insufficient_stock';
    end if;
  end loop;
end;
$$;

notify pgrst, 'reload schema';
