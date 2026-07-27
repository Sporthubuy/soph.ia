-- Fully fix memberships RLS: remove ALL recursive policies.
-- SELECT that queries memberships while selecting memberships causes
-- infinite recursion and empty results (so the app shows onboarding forever).

drop policy if exists "Org owners/admins can manage memberships" on public.memberships;
drop policy if exists "Users can view their memberships" on public.memberships;
drop policy if exists "Users can view their own membership" on public.memberships;
drop policy if exists "Org members can view other members" on public.memberships;
drop policy if exists "Users can insert themselves as member" on public.memberships;
drop policy if exists "Owners and admins can update memberships" on public.memberships;
drop policy if exists "Owners and admins can delete memberships" on public.memberships;

-- Helper: is the current user a member of this org? (SECURITY DEFINER bypasses RLS)
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = org_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = org_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

-- SELECT: own rows OR any row in an org you belong to (via definer fn, no recursion)
create policy "memberships_select"
  on public.memberships for select
  using (
    user_id = auth.uid()
    or public.is_org_member(organization_id)
  );

-- INSERT: only yourself
create policy "memberships_insert"
  on public.memberships for insert
  with check (user_id = auth.uid());

-- UPDATE / DELETE: admins only (via definer fn)
create policy "memberships_update"
  on public.memberships for update
  using (public.is_org_admin(organization_id));

create policy "memberships_delete"
  on public.memberships for delete
  using (public.is_org_admin(organization_id));

-- Also fix organizations select if needed: members can see their orgs
-- (existing policy already uses memberships subquery — may recurse through memberships)
drop policy if exists "Users can view their organizations" on public.organizations;

create policy "organizations_select"
  on public.organizations for select
  using (public.is_org_member(id));

drop policy if exists "Org owners can update their organization" on public.organizations;

create policy "organizations_update"
  on public.organizations for update
  using (public.is_org_admin(id));

-- Keep insert as-is if it exists; ensure authenticated can create
drop policy if exists "Authenticated users can create organizations" on public.organizations;

create policy "organizations_insert"
  on public.organizations for insert
  with check (auth.uid() is not null);