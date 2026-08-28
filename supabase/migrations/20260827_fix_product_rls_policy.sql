-- remove overly permissive public product read policy
drop policy if exists "Public can view active products" on public.products;

-- public read is now served exclusively through server-side API routes
-- the anon client must not read products directly from the browser
