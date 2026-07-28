-- Projects table
create table public.projects (
  id uuid default extensions.uuid_generate_v4() primary key,
  name text not null,
  description text default '' not null,
  icon text default 'folder_open' not null,
  color text default 'purple' not null,
  owner_id uuid references public.profiles(id) not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  status text default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "Org members can view projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = projects.organization_id
        and memberships.user_id = auth.uid()
    )
  );

create policy "Editors and above can create projects"
  on public.projects for insert
  with check (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = projects.organization_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('owner', 'admin', 'editor')
    )
  );

create policy "Editors and above can update projects"
  on public.projects for update
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = projects.organization_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('owner', 'admin', 'editor')
    )
  );

-- Indexes
create index idx_projects_org on public.projects(organization_id);
create index idx_projects_owner on public.projects(owner_id);
create index idx_projects_status on public.projects(status);

-- Updated_at trigger
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at();
