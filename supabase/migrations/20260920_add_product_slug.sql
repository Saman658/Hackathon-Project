alter table public.products
  add column if not exists slug text;

with normalized as (
  select
    id,
    coalesce(
      nullif(
        btrim(
          regexp_replace(
            regexp_replace(
              regexp_replace(lower(trim(coalesce(name, ''))), '[^A-Za-z0-9_[:space:]-]', '', 'g'),
              '[[:space:]_-]+', '-', 'g'
            ),
            '^-+|-+$', '', 'g'
          ),
          '-'
        ),
        ''
      ),
      'product-' || replace(id::text, '-', '')
    ) as generated_slug
  from public.products
  where slug is null or btrim(slug) = ''
)
update public.products p
set slug = n.generated_slug
from normalized n
where p.id = n.id;

do $$
declare
  duplicate_count integer;
  attempts integer := 0;
begin
  loop
    with duplicates as (
      select slug
      from public.products
      where slug is not null and btrim(slug) <> ''
      group by slug
      having count(*) > 1
    ), ranked as (
      select
        p.id,
        row_number() over (partition by p.slug order by p.id) as rn
      from public.products p
      inner join duplicates d on d.slug = p.slug
    )
    update public.products p
    set slug = p.slug || '-' || replace(ranked.id::text, '-', '')
    from ranked
    where p.id = ranked.id
      and ranked.rn > 1;

    select count(*)
    into duplicate_count
    from (
      select slug
      from public.products
      where slug is not null and btrim(slug) <> ''
      group by slug
      having count(*) > 1
    ) d;

    attempts := attempts + 1;
    exit when duplicate_count = 0 or attempts >= 100;
  end loop;

  if duplicate_count <> 0 then
    raise exception 'unable to make product slugs unique after % attempts', attempts;
  end if;
end $$;

alter table public.products
  alter column slug set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_slug_unique'
      and contype = 'u'
  ) then
    alter table public.products
      add constraint products_slug_unique unique (slug);
  end if;
end $$;

create index if not exists idx_products_slug on public.products(slug);

create or replace function public.set_product_slug()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  base_slug text;
  candidate text;
  suffix integer := 1;
begin
  if new.slug is null or btrim(new.slug) = '' then
    base_slug := nullif(
      btrim(
        regexp_replace(
          regexp_replace(
            regexp_replace(lower(trim(coalesce(new.name, ''))), '[^A-Za-z0-9_[:space:]-]', '', 'g'),
            '[[:space:]_-]+', '-', 'g'
          ),
          '^-+|-+$', '', 'g'
        ),
        '-'
      ),
      ''
    );

    if base_slug is null then
      base_slug := 'product-' || replace(coalesce(new.id::text, gen_random_uuid()::text), '-', '');
    end if;

    candidate := base_slug;

    while exists (
      select 1
      from public.products
      where slug = candidate
        and id is distinct from new.id
    ) loop
      candidate := base_slug || '-' || suffix::text;
      suffix := suffix + 1;
    end loop;

    new.slug := candidate;
  end if;

  return new;
end;
$$;

drop trigger if exists set_product_slug on public.products;

create trigger set_product_slug
before insert or update of name, slug
on public.products
for each row
execute function public.set_product_slug();

