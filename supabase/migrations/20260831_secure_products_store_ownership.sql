-- ============================================================================
-- Secure products RLS: verify store_id ownership on INSERT/UPDATE
-- ----------------------------------------------------------------------------
-- Context: The original product policies (20240103) only check
-- auth.uid() = user_id. A user can update their own product and set
-- store_id to a store they don't own, placing products in another
-- user's store (e.g. Sehrish's products into Mahrukh's store).
-- This migration adds a store-ownership guard to the INSERT/UPDATE
-- "with check" clauses. SELECT and DELETE are unchanged (user_id is
-- still the gate) — no data is moved or deleted.
-- ============================================================================

-- Helper: returns true if the given store_id belongs to the authenticated user
create or replace function public.user_owns_store(store_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.stores
    where stores.id = store_uuid
      and stores.user_id = auth.uid()
  )
$$;

-- Recreate INSERT policy with store ownership check
drop policy if exists "Users can insert their own products" on public.products;
create policy "Users can insert their own products"
  on public.products for insert
  with check (
    auth.uid() = user_id
    and (store_id is null or public.user_owns_store(store_id))
  );

-- Recreate UPDATE policy with store ownership check
drop policy if exists "Users can update their own products" on public.products;
create policy "Users can update their own products"
  on public.products for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (store_id is null or public.user_owns_store(store_id))
  );
