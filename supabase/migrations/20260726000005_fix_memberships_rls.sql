-- Fix infinite recursion in memberships RLS policy
-- The previous "Org owners/admins can manage memberships" policy used `for all`
-- with a self-referencing subquery that caused infinite recursion on INSERT
-- (checking memberships while inserting the first membership).

-- Drop the problematic policy
drop policy if exists "Org owners/admins can manage memberships" on public.memberships;

-- Drop and re-create the select policy to allow org members to see each other
drop policy if exists "Users can view their memberships" on public.memberships;

create policy "Users can view their own membership"
  on public.memberships for select
  using (user_id = auth.uid());

create policy "Org members can view other members"
  on public.memberships for select
  using (
    exists (
      select 1 from public.memberships as m
      where m.organization_id = memberships.organization_id
        and m.user_id = auth.uid()
    )
  );

-- Insert: no self-reference. User can only insert themselves.
-- This avoids recursion because the check does not query memberships.
create policy "Users can insert themselves as member"
  on public.memberships for insert
  with check (user_id = auth.uid());

-- Update: owners and admins can update memberships in their org
create policy "Owners and admins can update memberships"
  on public.memberships for update
  using (
    exists (
      select 1 from public.memberships as m
      where m.organization_id = memberships.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

-- Delete: owners and admins can delete memberships in their org
create policy "Owners and admins can delete memberships"
  on public.memberships for delete
  using (
    exists (
      select 1 from public.memberships as m
      where m.organization_id = memberships.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );