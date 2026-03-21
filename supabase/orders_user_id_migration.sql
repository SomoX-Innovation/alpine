-- Link storefront orders to the logged-in Supabase Auth user
alter table public.orders
add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_user_id on public.orders (user_id);
