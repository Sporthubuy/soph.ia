-- Bring the profile schema in line with the application and keep tenant
-- membership immutable from the browser.
alter table public.profiles
  add column if not exists username text,
  add column if not exists avatar_url text,
  add column if not exists cover_url text,
  add column if not exists city text,
  add column if not exists company text,
  add column if not exists birth_date date,
  add column if not exists bio text,
  add column if not exists role text,
  add column if not exists status text,
  add column if not exists website text,
  add column if not exists linkedin text,
  add column if not exists twitter text,
  add column if not exists instagram text;

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  and organization_id = (select public.current_organization_id())
);

-- RLS protects rows, while column grants prevent callers from changing the
-- immutable organization and authentication-linked email columns.
revoke update on public.profiles from authenticated;
grant update (
  full_name, initials, username, avatar_url, cover_url, city, company,
  birth_date, bio, role, status, website, linkedin, twitter, instagram
) on public.profiles to authenticated;

-- Attribute every direct API insert to the authenticated caller. The after
-- trigger creates the author share and audit record in the same transaction,
-- so failed inserts cannot leave a partially-created knowledge unit.
create or replace function public.assign_knowledge_unit_owner()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required to create a knowledge unit';
  end if;

  new.organization_id := public.current_organization_id();
  new.author_id := (select auth.uid());
  return new;
end;
$$;

create or replace function public.create_knowledge_unit_audit_rows()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.knowledge_unit_shares (knowledge_unit_id, profile_id, scope, role)
  values (new.id, new.author_id, 'Autor', 'Puede editar')
  on conflict (knowledge_unit_id, profile_id) do nothing;

  insert into public.knowledge_unit_history (knowledge_unit_id, actor_id, action)
  values (new.id, new.author_id, 'creó el borrador');

  return new;
end;
$$;

drop trigger if exists knowledge_units_assign_owner on public.knowledge_units;
create trigger knowledge_units_assign_owner
before insert on public.knowledge_units
for each row execute function public.assign_knowledge_unit_owner();

drop trigger if exists knowledge_units_create_audit_rows on public.knowledge_units;
create trigger knowledge_units_create_audit_rows
after insert on public.knowledge_units
for each row execute function public.create_knowledge_unit_audit_rows();

revoke execute on function public.assign_knowledge_unit_owner() from public, anon, authenticated;
revoke execute on function public.create_knowledge_unit_audit_rows() from public, anon, authenticated;

drop policy if exists "members can manage shares on org knowledge units" on public.knowledge_unit_shares;
create policy "members can manage shares on org knowledge units"
on public.knowledge_unit_shares
for insert
to authenticated
with check (
  exists (
    select 1
    from public.knowledge_units ku
    where ku.id = knowledge_unit_id
      and ku.organization_id = (select public.current_organization_id())
  )
  and exists (
    select 1
    from public.profiles profile
    where profile.id = profile_id
      and profile.organization_id = (select public.current_organization_id())
  )
);

drop policy if exists "members can add history on org knowledge units" on public.knowledge_unit_history;
create policy "members can add history on org knowledge units"
on public.knowledge_unit_history
for insert
to authenticated
with check (
  actor_id = (select auth.uid())
  and exists (
    select 1
    from public.knowledge_units ku
    where ku.id = knowledge_unit_id
      and ku.organization_id = (select public.current_organization_id())
  )
);

-- Profile media remains public only for delivery. Mutation is restricted to a
-- user-owned folder and the bucket accepts a small, explicit image allow-list.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "users can upload their profile media" on storage.objects;
drop policy if exists "users can view their profile media metadata" on storage.objects;
drop policy if exists "users can update their profile media" on storage.objects;
drop policy if exists "users can delete their profile media" on storage.objects;

create policy "users can upload their profile media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "users can view their profile media metadata"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "users can update their profile media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "users can delete their profile media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- The waitlist becomes server-mediated so it is rate limited and no longer
-- leaks whether a particular email address is already registered.
create table if not exists public.waitlist_rate_limits (
  ip_hash text primary key,
  last_submitted_at timestamptz not null default now()
);

alter table public.waitlist_rate_limits enable row level security;
revoke all on public.waitlist_rate_limits from anon, authenticated;

drop policy if exists "anon can insert waitlist signups" on public.waitlist_signups;
revoke insert on public.waitlist_signups from anon, authenticated;

create or replace function public.submit_waitlist_signup(
  p_name text,
  p_email text,
  p_source text,
  p_ip_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_ip_hash, 0));

  if exists (
    select 1
    from public.waitlist_rate_limits
    where ip_hash = p_ip_hash
      and last_submitted_at > now() - interval '10 minutes'
    for update
  ) then
    raise exception 'Too many waitlist requests. Please try again later.' using errcode = 'P0001';
  end if;

  insert into public.waitlist_rate_limits (ip_hash, last_submitted_at)
  values (p_ip_hash, now())
  on conflict (ip_hash) do update set last_submitted_at = excluded.last_submitted_at;

  insert into public.waitlist_signups (name, email, source)
  values (left(trim(p_name), 100), lower(left(trim(p_email), 320)), left(trim(p_source), 50))
  on conflict do nothing;
end;
$$;

revoke execute on function public.submit_waitlist_signup(text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_waitlist_signup(text, text, text, text) to service_role;
