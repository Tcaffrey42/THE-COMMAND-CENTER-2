-- CommandCenter V2.16 Auth + Roles Schema
-- Run this in Supabase SQL Editor after Auth is enabled.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'client' check (role in ('admin','executive','facility_manager','vendor','technician','client')),
  company text,
  status text not null default 'Active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy if not exists "users read own profile"
on profiles for select to authenticated
using (auth.uid() = id);

create policy if not exists "users update own profile basics"
on profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Admin helper: users with role admin can read/update all profiles.
create policy if not exists "admins read all profiles"
on profiles for select to authenticated
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy if not exists "admins update all profiles"
on profiles for update to authenticated
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- After you create your own user in Supabase Auth, promote yourself:
-- update profiles set role='admin', full_name='Tim Caffrey' where email='YOUR_EMAIL_HERE';
