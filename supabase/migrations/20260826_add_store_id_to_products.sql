-- add store_id to products
alter table public.products
  add column if not exists store_id uuid references public.stores(id) on delete set null;

create index if not exists idx_products_store_id on public.products(store_id);
