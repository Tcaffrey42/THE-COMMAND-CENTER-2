create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'client',
  company text,
  created_at timestamptz default now()
);
