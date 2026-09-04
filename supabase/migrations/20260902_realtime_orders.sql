-- ============================================================================
-- Realtime publication for orders + order_items
-- ----------------------------------------------------------------------------
-- Without adding tables to the supabase_realtime publication, the browser
-- client cannot subscribe to INSERT/UPDATE/DELETE events. This migration
-- adds the orders and order_items tables so the dashboard and orders pages
-- can react to new orders and status changes immediately.
--
-- The frontend filters by user_id (auth.uid()) so RLS still applies:
-- a user never receives events for another user's orders.
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

-- Add orders table to the publication (idempotent).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'orders'
    ) then
      alter publication supabase_realtime add table public.orders;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'order_items'
    ) then
      alter publication supabase_realtime add table public.order_items;
    end if;
  end if;
end $$;

-- REPLICA IDENTITY FULL ensures UPDATE/DELETE events include the previous
-- row data, which Supabase Realtime uses to dispatch the event payload.
alter table public.orders replica identity full;
alter table public.order_items replica identity full;