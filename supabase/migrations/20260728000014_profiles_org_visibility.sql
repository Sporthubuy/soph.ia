-- Allow org members to read profiles of people in the same organization
-- (needed for activity feed, settings members, project collab names).

drop policy if exists "Org members can view co-member profiles" on public.profiles;

create policy "Org members can view co-member profiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.memberships my
      join public.memberships theirs
        on theirs.organization_id = my.organization_id
      where my.user_id = auth.uid()
        and theirs.user_id = profiles.id
    )
  );
