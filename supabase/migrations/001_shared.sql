create table if not exists organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists org_members (
  org_id uuid references organisations(id),
  user_id uuid references auth.users(id),
  role text check (role in ('owner','member')),
  primary key (org_id, user_id)
);
