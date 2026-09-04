-- ============================================================================
-- Enforce one-store-per-admin at the database level
-- ----------------------------------------------------------------------------
-- Context: A user (auth.uid()) must own AT MOST ONE store. Until now there
-- was only a UI-side guard. This migration adds a database-level constraint
-- that the application cannot bypass:
--
--   1. Add UNIQUE constraint on stores.user_id (idempotent).
--   2. Keep the existing rows: if a user somehow has multiple stores, keep
--      only the OLDEST one (smallest created_at) and reassign any products
--      belonging to the dropped stores to the kept store. This preserves
--      data — nothing is deleted except duplicate store rows.
--   3. The unique constraint then makes any second INSERT fail with a
--      constraint violation (Supabase returns 23505). The UI/API treats
--      this as "you already have a store".
--
-- This is safe: any duplicates left over from testing will be collapsed
-- to the oldest store per user, and their products are reassigned to it.
-- ============================================================================

-- 1) Collapse duplicates BEFORE adding the constraint (otherwise it fails).
--    Keep the oldest store (smallest created_at) per user.
do $$
declare
  dup record;
begin
  for dup in
    select user_id, min(created_at) as keep_created_at
    from public.stores
    group by user_id
    having count(*) > 1
  loop
    -- Reassign products from any duplicate stores of this user to the
    -- oldest store, then delete the duplicate store rows.
    update public.products p
      set store_id = s_keep.id
    from public.stores s_dup
    join public.stores s_keep
      on s_keep.user_id = s_dup.user_id
     and s_keep.created_at = dup.keep_created_at
    where p.store_id = s_dup.id
      and s_dup.user_id = dup.user_id
      and s_dup.created_at <> dup.keep_created_at;

    delete from public.stores
    where user_id = dup.user_id
      and created_at <> dup.keep_created_at;
  end loop;
end $$;

-- 2) Add the unique constraint (idempotent). This is the actual enforcement.
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'stores'
      and indexname = 'stores_user_id_unique'
  ) then
    alter table public.stores
      add constraint stores_user_id_unique unique (user_id);
  end if;
end $$;