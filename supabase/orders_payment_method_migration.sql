-- Add payment method for orders (card vs cash on delivery)
alter table public.orders
add column if not exists payment_method text not null default 'card'
  check (payment_method in ('card', 'cod'));

comment on column public.orders.payment_method is 'card = paid at checkout (mock); cod = cash on delivery';
