-- Organizations, profiles, and knowledge units schema.
-- Auth is Supabase Auth (auth.users); every user belongs to exactly one
-- organization created automatically at signup via handle_new_user().

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null,
  email text not null,
  initials text not null,
  created_at timestamptz not null default now()
);

create index profiles_organization_id_idx on public.profiles (organization_id);

alter table public.profiles enable row level security;

-- Looks up the calling user's organization. SECURITY DEFINER is required
-- here to break the recursive RLS check that would otherwise happen when
-- this is used inside other tables' policies (querying profiles from
-- within a profiles policy). It only ever reads the caller's own row
-- (scoped by auth.uid()), so it cannot leak other users' data.
create function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

revoke all on function public.current_organization_id() from anon;
grant execute on function public.current_organization_id() to authenticated;

create policy "members can view their organization"
on public.organizations
for select
to authenticated
using (id = public.current_organization_id());

create policy "members can view profiles in their organization"
on public.profiles
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Creates an organization + profile automatically when a new user signs up.
-- SECURITY DEFINER is required because the new user has no profile yet,
-- so the normal RLS policies above would block the inserts this performs.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
  person_name text;
begin
  org_name := coalesce(nullif(trim(new.raw_user_meta_data->>'organization_name'), ''), split_part(new.email, '@', 1) || '''s workspace');
  person_name := coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1));

  insert into public.organizations (name, slug)
  values (org_name, lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(new.id::text, 1, 8))
  returning id into new_org_id;

  insert into public.profiles (id, organization_id, full_name, email, initials)
  values (
    new.id,
    new_org_id,
    person_name,
    new.email,
    upper(left(split_part(person_name, ' ', 1), 1) || left(coalesce(nullif(split_part(person_name, ' ', 2), ''), split_part(person_name, ' ', 1)), 1))
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table public.knowledge_units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  name text not null,
  type text not null check (type in ('Documento', 'Proceso', 'FAQ', 'Política', 'Guía', 'Dataset')),
  area text not null default 'General',
  status text not null default 'Borrador' check (status in ('Borrador', 'En revisión', 'Aprobada', 'Publicada', 'Por vencer')),
  format text not null default 'Markdown',
  language text not null default 'Español',
  version integer not null default 1,
  quality smallint not null default 0 check (quality between 0 and 100),
  usage_count integer not null default 0,
  tags text[] not null default '{}',
  expires_at timestamptz,
  source text not null default 'Manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index knowledge_units_organization_id_idx on public.knowledge_units (organization_id);

alter table public.knowledge_units enable row level security;

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger knowledge_units_set_updated_at
before update on public.knowledge_units
for each row execute function public.set_updated_at();

create policy "members can view org knowledge units"
on public.knowledge_units
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "members can create org knowledge units"
on public.knowledge_units
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "members can update org knowledge units"
on public.knowledge_units
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "members can delete org knowledge units"
on public.knowledge_units
for delete
to authenticated
using (organization_id = public.current_organization_id());

create table public.knowledge_unit_shares (
  id uuid primary key default gen_random_uuid(),
  knowledge_unit_id uuid not null references public.knowledge_units (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  scope text not null default 'Equipo',
  role text not null default 'Puede ver' check (role in ('Puede ver', 'Puede editar', 'Puede aprobar')),
  created_at timestamptz not null default now(),
  unique (knowledge_unit_id, profile_id)
);

create index knowledge_unit_shares_ku_id_idx on public.knowledge_unit_shares (knowledge_unit_id);

alter table public.knowledge_unit_shares enable row level security;

create policy "members can view shares on org knowledge units"
on public.knowledge_unit_shares
for select
to authenticated
using (
  exists (
    select 1 from public.knowledge_units ku
    where ku.id = knowledge_unit_id
    and ku.organization_id = public.current_organization_id()
  )
);

create policy "members can manage shares on org knowledge units"
on public.knowledge_unit_shares
for insert
to authenticated
with check (
  exists (
    select 1 from public.knowledge_units ku
    where ku.id = knowledge_unit_id
    and ku.organization_id = public.current_organization_id()
  )
);

create policy "members can remove shares on org knowledge units"
on public.knowledge_unit_shares
for delete
to authenticated
using (
  exists (
    select 1 from public.knowledge_units ku
    where ku.id = knowledge_unit_id
    and ku.organization_id = public.current_organization_id()
  )
);

create table public.knowledge_unit_history (
  id uuid primary key default gen_random_uuid(),
  knowledge_unit_id uuid not null references public.knowledge_units (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  created_at timestamptz not null default now()
);

create index knowledge_unit_history_ku_id_idx on public.knowledge_unit_history (knowledge_unit_id);

alter table public.knowledge_unit_history enable row level security;

create policy "members can view history on org knowledge units"
on public.knowledge_unit_history
for select
to authenticated
using (
  exists (
    select 1 from public.knowledge_units ku
    where ku.id = knowledge_unit_id
    and ku.organization_id = public.current_organization_id()
  )
);

create policy "members can add history on org knowledge units"
on public.knowledge_unit_history
for insert
to authenticated
with check (
  exists (
    select 1 from public.knowledge_units ku
    where ku.id = knowledge_unit_id
    and ku.organization_id = public.current_organization_id()
  )
);

-- Explicit grants so these tables stay reachable through the Data API
-- regardless of future auto-exposure changes (RLS above still governs rows).
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.knowledge_units to authenticated;
grant select, insert, update, delete on public.knowledge_unit_shares to authenticated;
grant select, insert, update, delete on public.knowledge_unit_history to authenticated;
