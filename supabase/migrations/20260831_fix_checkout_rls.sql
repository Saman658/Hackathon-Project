-- ============================================================================
-- Fix checkout RLS: allow anonymous/authenticated inserts for orders/order_items
-- ----------------------------------------------------------------------------
-- Context: Migration 20260851 re-enabled RLS and created INSERT policies,
-- but those policies were accidentally dropped during manual debugging.
-- This migration restores them idempotently.
--
-- Additionally, the checkout flow creates orders via the anon client and
-- immediately selects the inserted row. Anon users have no matching SELECT
-- policy because auth.uid() is null. To preserve the existing checkout UX
-- without weakening RLS, the client now generates the id and access_token
-- locally and skips the post-insert SELECT. No new SELECT policy is added.
-- ============================================================================

drop policy if exists "Anyone can insert orders" on public.orders;
create policy "Anyone can insert orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Anyone can insert order items" on public.order_items;
create policy "Anyone can insert order items"
  on public.order_items for insert
  with check (true);
