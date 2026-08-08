-- Enable RLS on organizations table
alter table public.organizations enable row level security;

-- Allow authenticated users to create organizations
create policy "authenticated users can create organizations"
on public.organizations
for insert
to authenticated
with check (true);

-- Allow users to view organizations they are members of
create policy "users can view their organizations"
on public.organizations
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles_organizations
    where organization_id = id
      and profile_id = (select auth.uid())
  )
);

-- Allow admins to update their organizations
create policy "organization admins can update"
on public.organizations
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles_organizations
    where organization_id = id
      and profile_id = (select auth.uid())
      and role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles_organizations
    where organization_id = id
      and profile_id = (select auth.uid())
      and role = 'admin'
  )
);
