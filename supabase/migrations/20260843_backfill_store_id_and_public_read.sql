-- Backfill store_id for existing products
-- Sets store_id to the user's store if the user has one and product.store_id is null
update public.products p
set store_id = s.id
from public.stores s
where p.store_id is null
  and p.user_id = s.user_id;

-- Add public read policy for stores (allows storefront to read store data)
create policy "Public can view stores"
  on public.stores for select
  using (true);
