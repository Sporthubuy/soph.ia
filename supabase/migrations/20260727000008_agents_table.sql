-- Agents table
create table public.agents (
  id uuid default extensions.uuid_generate_v4() primary key,
  name text not null,
  description text default '' not null,
  model text default 'claude-3.5-sonnet' not null,
  knowledge_ids uuid[] default '{}' not null,
  owner_id uuid references public.profiles(id) not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  status text default 'idle' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.agents enable row level security;

create policy "Org members can view agents"
  on public.agents for select
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = agents.organization_id
        and memberships.user_id = auth.uid()
    )
  );

create policy "Editors and above can create agents"
  on public.agents for insert
  with check (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = agents.organization_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('owner', 'admin', 'editor')
    )
  );

create policy "Editors and above can update agents"
  on public.agents for update
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = agents.organization_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('owner', 'admin', 'editor')
    )
  );

-- Indexes
create index idx_agents_org on public.agents(organization_id);
create index idx_agents_owner on public.agents(owner_id);
create index idx_agents_status on public.agents(status);

-- Updated_at trigger
create trigger set_agents_updated_at
  before update on public.agents
  for each row execute function public.update_updated_at();
