-- Team invitations: an owner/admin invites an email into their organization.
-- Because the app is single-org-per-user and every signup auto-creates a
-- personal workspace, acceptance is handled at signup: an invited email is
-- routed into the inviting org instead of getting its own workspace.

create table public.invitations (
  id uuid default extensions.uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role public.member_role default 'viewer' not null,
  token text not null unique,
  invited_by uuid references public.profiles(id) on delete set null,
  status text default 'pending' not null check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '14 days') not null
);

alter table public.invitations enable row level security;

-- Members of the org can see its invitations.
create policy "org members can view invitations"
  on public.invitations for select
  using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = invitations.organization_id
        and m.user_id = auth.uid()
    )
  );

-- Owners and admins manage invitations.
create policy "owners and admins manage invitations"
  on public.invitations for all
  using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = invitations.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.memberships m
      where m.organization_id = invitations.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

create index idx_invitations_email on public.invitations (lower(email));
create index idx_invitations_token on public.invitations (token);
create index idx_invitations_org on public.invitations (organization_id);

-- Route invited signups into the inviting org. The invitation routing is
-- nested with its own fallback so a failure never blocks signup.
create or replace function public.handle_new_user_combined()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  org_id uuid;
  inv record;
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  begin
    select * into inv
    from public.invitations
    where lower(email) = lower(new.email)
      and status = 'pending'
      and expires_at > now()
    order by created_at desc
    limit 1;

    if inv.id is not null then
      insert into public.memberships (user_id, organization_id, role)
      values (new.id, inv.organization_id, inv.role)
      on conflict (user_id, organization_id) do nothing;

      update public.invitations set status = 'accepted' where id = inv.id;
      return new;
    end if;
  exception when others then
    -- fall through to personal-workspace creation below
    null;
  end;

  insert into public.organizations (name, slug)
  values (
    split_part(new.email, '@', 1) || '''s Workspace',
    split_part(new.email, '@', 1) || '-' || substr(new.id::text, 1, 8)
  )
  returning id into org_id;

  insert into public.memberships (user_id, organization_id, role)
  values (new.id, org_id, 'owner')
  on conflict (user_id, organization_id) do nothing;

  return new;
end;
$$;
