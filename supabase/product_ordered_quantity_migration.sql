-- Total units ordered (incremented on each checkout line). Stock field remains `quantity`.
alter table public.products
add column if not exists ordered_quantity integer not null default 0 check (ordered_quantity >= 0);

-- Atomic increment; only callable with service_role (see grants below).
create or replace function public.increment_product_ordered_quantity(p_product_id uuid, p_qty int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_qty is null or p_qty <= 0 then
    return;
  end if;
  update public.products
  set
    ordered_quantity = ordered_quantity + p_qty,
    updated_at = now()
  where id = p_product_id;
end;
$$;

revoke all on function public.increment_product_ordered_quantity(uuid, int) from public;
grant execute on function public.increment_product_ordered_quantity(uuid, int) to service_role;
