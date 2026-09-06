-- ============================================================================
-- Mahrukh Ariqa storefront product images
-- ----------------------------------------------------------------------------
-- Set Mahrukh Ariqa's own storefront images on the 4 products in the Mahrukh
-- store (store_id = d465ed93-a315-45d9-baab-617c2a577a6b).
--
-- Only image_url is updated. The statements are idempotent and scoped by
-- SKU + store_id so they can only ever affect the intended products. No
-- product names, prices, stock, SKUs, status, store IDs, orders, or RLS
-- policies are changed.
--
-- Sources are the store's own published product photos (beyonddetail.pk,
-- afiay.com, limelight.pk, miandadfabrics.com). No Unsplash, no dilkash,
-- and no local /products/... fallback assets are used.
-- ============================================================================

update public.products
   set image_url = 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_10_21_11PM.png?v=1775911071&width=1100'
 where sku = 'MAHRUKH-BEYOND-001'
   and store_id = 'd465ed93-a315-45d9-baab-617c2a577a6b';

update public.products
   set image_url = 'https://afiay.com/cdn/shop/files/Price6700t.png?v=1786286662&width=3840'
 where sku = 'MAHRUKH-LAWN-001'
   and store_id = 'd465ed93-a315-45d9-baab-617c2a577a6b';

update public.products
   set image_url = 'https://www.limelight.pk/cdn/shop/files/U4923SU-3PC-227-3PieceLawnSuit_Unstitched_3.jpg?v=1783404694&width=1445'
 where sku = 'MAHRUKH-HAMZA-001'
   and store_id = 'd465ed93-a315-45d9-baab-617c2a577a6b';

update public.products
   set image_url = 'https://miandadfabrics.com/cdn/shop/files/1_661b7bd6-c327-49e0-a48c-01b37b8413e4.jpg?v=1784874932&width=533'
 where sku = 'MAHRUKH-CHEVRON-001'
   and store_id = 'd465ed93-a315-45d9-baab-617c2a577a6b';

-- Defensive cleanup: any Mahrukh product whose image_url is still a stale
-- local /products/... fallback (e.g. the old mahrukh-hamza.webp asset) is
-- reset to its correct storefront image. Only image_url is touched, scoped
-- to the Mahrukh store + SKUs above, and only when the current value is a
-- local path or null.
update public.products
   set image_url = case sku
     when 'MAHRUKH-BEYOND-001'  then 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_10_21_11PM.png?v=1775911071&width=1100'
     when 'MAHRUKH-LAWN-001'    then 'https://afiay.com/cdn/shop/files/Price6700t.png?v=1786286662&width=3840'
     when 'MAHRUKH-HAMZA-001'   then 'https://www.limelight.pk/cdn/shop/files/U4923SU-3PC-227-3PieceLawnSuit_Unstitched_3.jpg?v=1783404694&width=1445'
     when 'MAHRUKH-CHEVRON-001' then 'https://miandadfabrics.com/cdn/shop/files/1_661b7bd6-c327-49e0-a48c-01b37b8413e4.jpg?v=1784874932&width=533'
   end
 where store_id = 'd465ed93-a315-45d9-baab-617c2a577a6b'
   and sku in ('MAHRUKH-BEYOND-001', 'MAHRUKH-LAWN-001', 'MAHRUKH-HAMZA-001', 'MAHRUKH-CHEVRON-001')
   and (image_url is null or image_url like '/products/%' or image_url like '%mahrukh-hamza.webp%');
