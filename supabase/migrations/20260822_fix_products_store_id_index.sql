-- Fix broken products.store_id index and ensure RLS is properly enabled

-- Drop the incorrectly created index on stores(store_id)
drop index if exists public.idx_products_store_id;

-- Create the correct index on products(store_id)
create index if not exists idx_products_store_id on public.products(store_id);
