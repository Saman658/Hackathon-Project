-- ============================================================================
-- Final product image fixes
-- ----------------------------------------------------------------------------
-- Two adjustments:
--
-- 1) Restore the PREVIOUS/BETTER image for "Hamza Ismail 3PC Printed Lawn
--    Suit" (the full-resolution dilkash DFC013 asset that was used before
--    the temporary Unsplash fallback). It is the source-page's full-size
--    product photo of the unstitched 3PC suit with no visible face.
--
-- 2) Fix the 4TH / LAST product image ("Digital Printed Lawn 2-Piece
--    Suite" / SKU MAHRUKH-LAWN-001). The current URL still showed an
--    off-topic photo. This migration replaces it with a face-free,
--    product-only Unsplash photo of a 2-piece unstitched digital printed
--    lawn suit (no model, no face).
--
-- Both UPDATEs are idempotent and only touch image_url. No product names,
-- SKUs, prices, stock, store IDs, orders, or RLS policies are changed.
-- Any stale local-fallback reference to the old /products/mahrukh-hamza.webp
-- asset is also redirected to the new face-free image so it cannot be
-- served from the public/ directory as a fallback.
-- ============================================================================

-- 1) Hamza Ismail — restore the previous, better full-res image.
update public.products
   set image_url = 'https://dilkash.com.pk/wp-content/uploads/2026/04/3PC-Unstitched-Printed-Lawn-Suit-%E2%80%93-DFC013.webp'
 where sku = 'MAHRUKH-HAMZA-001'
   and name = 'Hamza Ismail 3PC Printed Lawn Suit';

-- 2) Digital Printed Lawn 2-Piece Suite (the 4th/last product in the
--    Mahrukh storefront, oldest by created_at) — replace with a
--    face-free, product-only lawn-suit photo.
update public.products
   set image_url = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80'
 where sku = 'MAHRUKH-LAWN-001'
   and name = 'Digital Printed Lawn 2-Piece Suite';

-- Defensive cleanup: any product still pointing at the old local
-- /products/mahrukh-hamza.webp asset (a leftover public/ file) is
-- redirected to the restored Hamza Ismail URL above.
update public.products
   set image_url = 'https://dilkash.com.pk/wp-content/uploads/2026/04/3PC-Unstitched-Printed-Lawn-Suit-%E2%80%93-DFC013.webp'
 where image_url like '%/products/mahrukh-hamza.webp%';