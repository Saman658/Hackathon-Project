create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- Fix: Admins can view all profiles
drop policy if exists "Admins can view all profiles"
on public.profiles;

create policy "Admins can view all profiles"
on public.profiles
for select
using (
  auth.uid() = id
  or public.is_admin()
);

-- Fix: Admins can update any profile is_active
drop policy if exists "Admins can update any profile is_active"
on public.profiles;

create policy "Admins can update any profile is_active"
on public.profiles
for update
using (
  auth.uid() = id
  or public.is_admin()
)
with check (
  auth.uid() = id
  or public.is_admin()
);

-- Fix trigger function to use the helper
create or replace function public.prevent_admin_field_change()
returns trigger as $$
begin

  if NEW.is_admin is distinct from OLD.is_admin then
    raise exception 'is_admin cannot be changed via UPDATE';
  end if;

  if NEW.is_active is distinct from OLD.is_active then
    if not public.is_admin() then
      raise exception 'Only admins can change is_active';
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;
