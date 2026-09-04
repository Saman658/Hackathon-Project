-- Add category column to products table and set it for the
-- Hamza Ismail 3PC Unstitched Printed Lawn Suit product (DEC013 / DFC013 variant)
-- in Mahrukh's store.
--
-- This is the only change: only this single product's category is set to
-- '3 Piece Suit'. No other product is modified. No title, price, description,
-- image, SKU, stock, or status fields are touched.
--
-- The category column is added with IF NOT EXISTS so the migration is safe
-- to re-run. The UPDATE is scoped by both id and store_id to guarantee only
-- the intended product is affected.

alter table public.products
  add column if not exists category text;

update public.products
   set category = '3 Piece Suit'
 where id = '022e4ea8-f413-4a73-9e00-f00922264974'
   and store_id = 'd465ed93-a315-45d9-baab-617c2a577a6b';
