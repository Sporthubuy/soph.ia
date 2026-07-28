-- Activity logs table for tracking user actions
create table public.activity_logs (
  id uuid default extensions.uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  action_type text not null, -- 'create_project', 'create_ku', 'approve_ku', 'edit_project', etc.
  entity_type text not null, -- 'project', 'knowledge_unit', 'agent'
  entity_id uuid not null,
  entity_title text not null,
  description text,
  created_at timestamptz default now() not null
);

alter table public.activity_logs enable row level security;

create policy "Org members can view activity logs"
  on public.activity_logs for select
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = activity_logs.organization_id
        and memberships.user_id = auth.uid()
    )
  );

-- Auto-log when project is created
create or replace function public.log_project_creation()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.activity_logs (organization_id, user_id, action_type, entity_type, entity_id, entity_title, description)
  values (
    new.organization_id,
    new.owner_id,
    'create_project',
    'project',
    new.id,
    new.name,
    'Created a new project'
  );
  return new;
end;
$$;

create trigger on_project_created
  after insert on public.projects
  for each row execute function public.log_project_creation();

-- Auto-log when knowledge unit is created
create or replace function public.log_ku_creation()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.activity_logs (organization_id, user_id, action_type, entity_type, entity_id, entity_title, description)
  values (
    new.organization_id,
    new.owner_id,
    'create_knowledge_unit',
    'knowledge_unit',
    new.id,
    new.title,
    'Created a new knowledge unit'
  );
  return new;
end;
$$;

create trigger on_ku_created
  after insert on public.knowledge_units
  for each row execute function public.log_ku_creation();

-- Indexes for performance
create index idx_activity_logs_org on public.activity_logs(organization_id);
create index idx_activity_logs_user on public.activity_logs(user_id);
create index idx_activity_logs_created on public.activity_logs(created_at desc);
