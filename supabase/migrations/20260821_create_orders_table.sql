-- orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  store_id text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  city text not null,
  postal_code text not null,
  subtotal numeric not null,
  shipping numeric not null default 0,
  total numeric not null,
  status text not null default 'Pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can update their own orders"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can insert orders"
  on public.orders for insert
  with check (true);

create policy "Users can delete their own orders"
  on public.orders for delete
  using (auth.uid() = user_id);

create or replace function public.handle_order_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists handle_order_updated_at on public.orders;

create trigger handle_order_updated_at
  before update on public.orders
  for each row execute procedure public.handle_order_updated_at();
