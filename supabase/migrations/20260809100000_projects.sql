-- Projects: collaborative workspaces for building agents and KUs as a team.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'archived')),
  owner_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_org on public.projects(organization_id);

alter table public.projects enable row level security;

create policy "org members can view projects"
  on public.projects for select to authenticated
  using (organization_id = public.current_organization_id());

create policy "org members can insert projects"
  on public.projects for insert to authenticated
  with check (organization_id = public.current_organization_id());

create policy "project owner can update"
  on public.projects for update to authenticated
  using (organization_id = public.current_organization_id());

create policy "project owner can delete"
  on public.projects for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Project members with roles
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  joined_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists idx_project_members_project on public.project_members(project_id);
create index if not exists idx_project_members_user on public.project_members(user_id);

alter table public.project_members enable row level security;

create policy "org members can view project members"
  on public.project_members for select to authenticated
  using (
    project_id in (
      select id from public.projects where organization_id = public.current_organization_id()
    )
  );

create policy "project owners can manage members"
  on public.project_members for all to authenticated
  using (
    project_id in (
      select id from public.projects where organization_id = public.current_organization_id()
    )
  );

-- Project tasks for assigning work
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  type text not null default 'general' check (type in ('agent', 'ku', 'general')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  assigned_to uuid references auth.users(id),
  related_agent_id uuid references public.agents(id) on delete set null,
  related_ku_id uuid references public.knowledge_units(id) on delete set null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_tasks_project on public.project_tasks(project_id);

alter table public.project_tasks enable row level security;

create policy "org members can view project tasks"
  on public.project_tasks for select to authenticated
  using (
    project_id in (
      select id from public.projects where organization_id = public.current_organization_id()
    )
  );

create policy "org members can manage project tasks"
  on public.project_tasks for all to authenticated
  using (
    project_id in (
      select id from public.projects where organization_id = public.current_organization_id()
    )
  );

-- Link agents and KUs to projects
alter table public.agents
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.knowledge_units
  add column if not exists project_id uuid references public.knowledge_units(id) on delete set null;

-- Fix: KU project_id should reference projects, not knowledge_units
alter table public.knowledge_units
  drop constraint if exists knowledge_units_project_id_fkey;
alter table public.knowledge_units
  add constraint knowledge_units_project_id_fkey
  foreign key (project_id) references public.projects(id) on delete set null;
