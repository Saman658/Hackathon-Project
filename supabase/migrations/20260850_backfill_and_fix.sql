-- Backfill store_id for existing products
-- Sets store_id to the user's store if the user has one and product.store_id is null
UPDATE public.products p
SET store_id = s.id
FROM public.stores s
WHERE p.store_id IS NULL
  AND p.user_id = s.user_id;

-- Add public read policy for stores (allows storefront to read store data)
CREATE POLICY IF NOT EXISTS "Public can view stores"
  ON public.stores FOR SELECT
  USING (true);
