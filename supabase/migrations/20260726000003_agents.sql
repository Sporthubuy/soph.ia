-- Agent deployments: stores compiled agent configs scoped to an organization.
-- Each row represents a deployed agent referencing a set of approved Knowledge Units
-- plus lightweight monitoring stats (invocation count, last invocation, status).

create table public.agents (
  id uuid default extensions.uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  description text,
  system_prompt text,
  provider text default 'anthropic' not null,
  model text default 'claude-3-5-sonnet-latest' not null,
  temperature real default 0.4 not null,
  selected_ku_ids uuid[] default '{}' not null,
  status text default 'draft' not null check (status in ('draft', 'deployed', 'paused', 'archived')),
  invocations integer default 0 not null,
  last_invoked_at timestamptz,
  created_by uuid references public.profiles(id) not null,
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

create policy "Editors and above can delete agents"
  on public.agents for delete
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = agents.organization_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('owner', 'admin', 'editor')
    )
  );

create index idx_agents_org on public.agents(organization_id);
create index idx_agents_status on public.agents(status);

create trigger set_agents_updated_at
  before update on public.agents
  for each row execute function public.update_updated_at();

-- Increment invocation count and stamp last_invoked_at for monitoring.
-- SECURITY DEFINER so the route handler can call it via the service role client
-- without worrying about RLS on caller-aware paths.
create or replace function public.increment_agent_invocations(agent_id uuid)
returns void
language sql
security definer set search_path = ''
as $$
  update public.agents
  set invocations = invocations + 1,
      last_invoked_at = now()
  where id = agent_id and status = 'deployed';
$$;