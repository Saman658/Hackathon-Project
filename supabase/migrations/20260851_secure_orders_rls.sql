-- ============================================================================
-- Secure public.orders and public.order_items
-- ----------------------------------------------------------------------------
-- Context: RLS was disabled by 20260842_disable_rls.sql so the public
-- storefront could read orders. That made ALL order/customer PII world-readable
-- (the anon key is shipped in the browser). This migration restores
-- least-privilege RLS and adds a non-guessable `access_token` so the
-- order-success page can look an order up securely server-side (via the
-- service-role key) WITHOUT making `orders` publicly readable.
--
-- No data is deleted or modified except backfilling a new token column.
-- ============================================================================

-- 1) Non-guessable token used by the secure server-side order lookup.
alter table public.orders add column if not exists access_token uuid;

-- Backfill existing rows (a volatile default is not applied retroactively).
update public.orders set access_token = gen_random_uuid() where access_token is null;

alter table public.orders alter column access_token set default gen_random_uuid();
alter table public.orders alter column access_token set not null;

-- 2) public.orders policies (recreated idempotently; same intent as 20260821).
--    Store owners (orders.user_id = their auth id) may read/update/delete their
--    own orders. Anonymous checkout may INSERT (required by the storefront).
drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own orders" on public.orders;
create policy "Users can update their own orders"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Anyone can insert orders" on public.orders;
create policy "Anyone can insert orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Users can delete their own orders" on public.orders;
create policy "Users can delete their own orders"
  on public.orders for delete
  using (auth.uid() = user_id);

-- 3) public.order_items policies (protected consistently with the parent order).
drop policy if exists "Users can view their own order items" on public.order_items;
create policy "Users can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

drop policy if exists "Anyone can insert order items" on public.order_items;
create policy "Anyone can insert order items"
  on public.order_items for insert
  with check (true);

drop policy if exists "Users can delete their own order items" on public.order_items;
create policy "Users can delete their own order items"
  on public.order_items for delete
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- 4) Re-enable Row Level Security so the policies above are enforced.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
