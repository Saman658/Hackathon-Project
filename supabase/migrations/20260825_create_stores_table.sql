-- stores table
create table if not exists public.stores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text not null,
  description text,
  logo text,
  hero_title text not null default '',
  hero_description text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.stores enable row level security;

create policy "Users can view their own stores"
  on public.stores for select
  using (auth.uid() = user_id);

create policy "Users can insert their own stores"
  on public.stores for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own stores"
  on public.stores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own stores"
  on public.stores for delete
  using (auth.uid() = user_id);

create or replace function public.handle_store_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists handle_store_updated_at on public.stores;

create trigger handle_store_updated_at
  before update on public.stores
  for each row execute procedure public.handle_store_updated_at();
