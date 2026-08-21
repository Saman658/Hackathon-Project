-- Fix headphone product stock
update public.products
set stock = 10
where sku = 'SUP-OLD' or name = 'Headphones';
