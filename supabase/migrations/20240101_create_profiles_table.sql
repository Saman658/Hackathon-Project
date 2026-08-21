-- profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  business_name text,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;


-- Users can view their own profile
drop policy if exists "Users can view their own profile"
on public.profiles;

create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);


-- Users can insert their own profile
drop policy if exists "Users can insert their own profile"
on public.profiles;

create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);


-- Users can update their own profile
drop policy if exists "Users can update their own profile"
on public.profiles;

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);


-- Function for automatically creating a profile
create or replace function public.handle_new_user()
returns trigger
as $$
begin
  insert into public.profiles (id, name, business_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'business_name', ''),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;


-- Trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();