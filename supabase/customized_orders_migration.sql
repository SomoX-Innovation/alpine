create table if not exists public.customized_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null default '',
  tshirt_type text not null check (tshirt_type in ('Regular', 'Oversize')),
  print_size text not null check (print_size in ('A4', 'A3')),
  placements jsonb not null default '[]',
  design_urls jsonb not null default '{}',
  size_quantities jsonb not null default '{}',
  quantity integer not null default 0 check (quantity >= 0),
  notes text not null default '',
  total numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customized_orders_created_at on public.customized_orders(created_at desc);
create index if not exists customized_orders_email on public.customized_orders(customer_email);
