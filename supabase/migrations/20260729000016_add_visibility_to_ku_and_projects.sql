-- Add visibility column to knowledge_units and projects
-- Enables private workspace + public marketplace model

alter table public.knowledge_units
  add column if not exists visibility text default 'private' not null check (visibility in ('private', 'public', 'unlisted'));

alter table public.projects
  add column if not exists visibility text default 'private' not null check (visibility in ('private', 'public', 'unlisted'));

-- Update RLS policies to allow public reads

drop policy if exists "Org members can view knowledge units" on public.knowledge_units;

create policy "Knowledge units readable if org member or public"
  on public.knowledge_units for select
  using (
    visibility = 'public'
    or exists (
      select 1 from public.memberships
      where memberships.organization_id = knowledge_units.organization_id
        and memberships.user_id = auth.uid()
    )
  );

drop policy if exists "Org members can view projects" on public.projects;

create policy "Projects readable if org member or public"
  on public.projects for select
  using (
    visibility = 'public'
    or exists (
      select 1 from public.memberships
      where memberships.organization_id = projects.organization_id
        and memberships.user_id = auth.uid()
    )
  );

-- Update agents RLS to match pattern

drop policy if exists "Org members can view agents" on public.agents;

create policy "Agents readable if org member or public"
  on public.agents for select
  using (
    visibility = 'public'
    or exists (
      select 1 from public.memberships
      where memberships.organization_id = agents.organization_id
        and memberships.user_id = auth.uid()
    )
  );

-- Update match_kus to include visibility
-- Security definer so it respects our visibility model

create or replace function public.match_kus(
  query_embedding extensions.vector(1536),
  query_organization_id uuid,
  match_count integer default 10,
  filter_status public.ku_status default null,
  include_public boolean default false
)
returns table (
  id uuid,
  title text,
  content text,
  status public.ku_status,
  domain_id uuid,
  organization_id uuid,
  visibility text,
  similarity float
)
language sql
security definer set search_path = 'extensions'
as $$
  select
    ku.id,
    ku.title,
    ku.content,
    ku.status,
    ku.domain_id,
    ku.organization_id,
    ku.visibility,
    1 - (ku.embedding <=> query_embedding) as similarity
  from public.knowledge_units ku
  where (
    ku.organization_id = query_organization_id
    or (include_public and ku.visibility = 'public')
  )
    and ku.embedding is not null
    and (filter_status is null or ku.status = filter_status)
  order by ku.embedding <=> query_embedding
  limit match_count
$$;

-- Index for visibility + org queries
create index if not exists idx_knowledge_units_visibility_org
  on public.knowledge_units(visibility, organization_id);

create index if not exists idx_projects_visibility_org
  on public.projects(visibility, organization_id);

create index if not exists idx_agents_visibility_org
  on public.agents(visibility, organization_id);
