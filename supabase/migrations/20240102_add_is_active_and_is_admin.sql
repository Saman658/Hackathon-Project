alter table public.profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists is_admin boolean not null default false;

drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (auth.uid() = id or exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  ));

create policy "Admins can update any profile is_active"
  on public.profiles for update
  using (auth.uid() = id or exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  ))
  with check (
    auth.uid() = id
    or
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and is_admin = true
      )
      and not exists (
        select 1 from public.profiles
        where id = new.id and is_admin = true
      )
    )
  );

create or replace function public.prevent_admin_field_change()
returns trigger as $$
begin
  if row(is_admin) is distinct from row(OLD.is_admin) then
    raise exception 'is_admin cannot be changed via UPDATE';
  end if;
  if row(is_active) is distinct from row(OLD.is_active) then
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    ) then
      raise exception 'Only admins can change is_active';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists prevent_admin_field_change on public.profiles;

create trigger prevent_admin_field_change
  before update of is_active, is_admin on public.profiles
  for each row execute procedure public.prevent_admin_field_change();
