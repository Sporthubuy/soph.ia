-- Team membership via invitations.
-- Each organization can invite users by email. Accepting the invitation
-- moves the invitee's profile.organization_id to the inviting org.
-- One-org-per-user model (simple; multi-org can come later).

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  token text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null
);

create unique index if not exists idx_org_invitations_pending_email
  on public.organization_invitations (organization_id, lower(email))
  where status = 'pending';

create index if not exists idx_org_invitations_email on public.organization_invitations (lower(email));
create index if not exists idx_org_invitations_token on public.organization_invitations (token);

alter table public.organization_invitations enable row level security;

-- Members of the org see and manage its invitations
create policy "members can view org invitations"
on public.organization_invitations for select to authenticated
using (organization_id = (select public.current_organization_id()));

create policy "members can create org invitations"
on public.organization_invitations for insert to authenticated
with check (
  organization_id = (select public.current_organization_id())
  and invited_by = (select auth.uid())
);

create policy "members can update org invitations"
on public.organization_invitations for update to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy "members can delete org invitations"
on public.organization_invitations for delete to authenticated
using (organization_id = (select public.current_organization_id()));

-- Invitees can also see their own pending invitations
create policy "invitees can view their invitations"
on public.organization_invitations for select to authenticated
using (
  lower(email) = (select lower(email) from public.profiles where id = auth.uid())
);

grant select, insert, update, delete on public.organization_invitations to authenticated;

-- Function to accept an invitation. Runs as security definer so it can
-- update the caller's profile even though the caller isn't an org member yet.
create or replace function public.accept_invitation(invitation_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv record;
  caller_id uuid := auth.uid();
  caller_email text;
  old_org_id uuid;
  new_profile_org_id uuid;
begin
  if caller_id is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;

  select email, organization_id into caller_email, old_org_id
  from public.profiles where id = caller_id;

  select * into inv from public.organization_invitations
  where token = invitation_token
    and status = 'pending'
    and expires_at > now()
  limit 1;

  if inv is null then
    raise exception 'invitation not found or expired' using errcode = 'P0001';
  end if;

  if lower(inv.email) <> lower(caller_email) then
    raise exception 'invitation email does not match your account' using errcode = 'P0001';
  end if;

  update public.profiles set organization_id = inv.organization_id where id = caller_id
  returning organization_id into new_profile_org_id;

  update public.organization_invitations
    set status = 'accepted', accepted_at = now(), accepted_by = caller_id
    where id = inv.id;

  -- Best-effort cleanup: if the caller's old org is now empty, remove it.
  if old_org_id is not null and old_org_id <> inv.organization_id then
    delete from public.organizations
    where id = old_org_id
      and not exists (select 1 from public.profiles where organization_id = old_org_id);
  end if;

  return jsonb_build_object('organization_id', new_profile_org_id);
end;
$$;

revoke all on function public.accept_invitation(text) from public, anon;
grant execute on function public.accept_invitation(text) to authenticated;
