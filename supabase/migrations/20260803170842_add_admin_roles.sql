-- Create admin_roles table
create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'moderator')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Enable RLS
alter table public.admin_roles enable row level security;

-- RLS policies
create policy "Only admins can read admin_roles"
on public.admin_roles for select
to authenticated
using (
  exists (
    select 1 from public.admin_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

-- Grant access to authenticated users (they can check if they're admin)
grant select on public.admin_roles to authenticated;

-- Create index on user_id for faster lookups
create index if not exists idx_admin_roles_user_id on public.admin_roles(user_id);
