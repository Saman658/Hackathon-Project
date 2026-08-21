alter table public.products
  add constraint products_user_id_sku_key unique (user_id, sku);
