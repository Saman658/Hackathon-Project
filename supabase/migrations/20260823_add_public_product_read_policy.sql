-- allow public read access to active products for the storefront
create policy "Public can view active products"
  on public.products for select
  using (status = 'Active');
