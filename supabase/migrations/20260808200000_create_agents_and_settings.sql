-- Create agents table
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft',
  type text not null default 'ai', -- ai, automation, workflow
  prompt text,
  model text default 'claude-3.5-sonnet',
  temperature decimal(2,1) default 0.7,
  max_tokens integer default 4096,
  version integer not null default 1,
  usage_count integer not null default 0,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_agents_organization_id on public.agents(organization_id);
create index idx_agents_author_id on public.agents(author_id);
create index idx_agents_status on public.agents(status);

-- Create agents_knowledge_units junction table
create table if not exists public.agents_knowledge_units (
  agent_id uuid not null references public.agents(id) on delete cascade,
  knowledge_unit_id uuid not null references public.knowledge_units(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (agent_id, knowledge_unit_id)
);

create index idx_agents_knowledge_units_ku on public.agents_knowledge_units(knowledge_unit_id);

-- Create settings table (org level)
create table if not exists public.org_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  theme text default 'dark',
  language text default 'es',
  timezone text default 'America/Montevideo',
  notifications_enabled boolean default true,
  max_knowledge_units integer default 1000,
  max_agents integer default 100,
  max_storage_gb integer default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_org_settings_organization_id on public.org_settings(organization_id);

-- Create user settings table (personal level)
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  theme text default 'dark',
  language text default 'es',
  timezone text default 'America/Montevideo',
  email_notifications boolean default true,
  show_in_profile boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_user_settings_profile_id on public.user_settings(profile_id);

-- Enable RLS
alter table public.agents enable row level security;
alter table public.agents_knowledge_units enable row level security;
alter table public.org_settings enable row level security;
alter table public.user_settings enable row level security;

-- RLS Policies for agents
create policy "members can view org agents"
on public.agents
for select
to authenticated
using (organization_id = (select public.current_organization_id()));

create policy "members can create agents"
on public.agents
for insert
to authenticated
with check (organization_id = (select public.current_organization_id()));

create policy "authors can update their agents"
on public.agents
for update
to authenticated
using (author_id = (select auth.uid()) and organization_id = (select public.current_organization_id()))
with check (author_id = (select auth.uid()) and organization_id = (select public.current_organization_id()));

create policy "authors can delete their agents"
on public.agents
for delete
to authenticated
using (author_id = (select auth.uid()) and organization_id = (select public.current_organization_id()));

-- RLS Policies for agents_knowledge_units
create policy "members can manage agent ku links"
on public.agents_knowledge_units
for all
to authenticated
using (
  exists (
    select 1
    from public.agents a
    where a.id = agent_id
      and a.organization_id = (select public.current_organization_id())
  )
);

-- RLS Policies for org_settings
create policy "members can view org settings"
on public.org_settings
for select
to authenticated
using (organization_id = (select public.current_organization_id()));

create policy "admins can update org settings"
on public.org_settings
for update
to authenticated
using (
  organization_id = (select public.current_organization_id())
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
)
with check (
  organization_id = (select public.current_organization_id())
);

-- RLS Policies for user_settings
create policy "users can view their settings"
on public.user_settings
for select
to authenticated
using (profile_id = (select auth.uid()));

create policy "users can update their settings"
on public.user_settings
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

-- Trigger to auto-create org settings
create or replace function public.create_org_settings()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.org_settings (organization_id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists organizations_create_settings on public.organizations;
create trigger organizations_create_settings
after insert on public.organizations
for each row execute function public.create_org_settings();

-- Trigger to auto-create user settings
create or replace function public.create_user_settings()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.user_settings (profile_id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists profiles_create_settings on public.profiles;
create trigger profiles_create_settings
after insert on public.profiles
for each row execute function public.create_user_settings();

-- Trigger for agents updated_at
create or replace function public.update_agents_timestamp()
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

drop trigger if exists agents_update_timestamp on public.agents;
create trigger agents_update_timestamp
before update on public.agents
for each row execute function public.update_agents_timestamp();

-- Revoke function execute permissions
revoke execute on function public.create_org_settings() from public, anon, authenticated;
revoke execute on function public.create_user_settings() from public, anon, authenticated;
revoke execute on function public.update_agents_timestamp() from public, anon, authenticated;
