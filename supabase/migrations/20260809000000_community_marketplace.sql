-- Community marketplace: add visibility to agents, forked_from tracking,
-- and RLS policies for cross-org public access.

-- 1. Add visibility to agents (mirrors KU visibility)
alter table public.agents
  add column if not exists visibility text not null default 'team'
    check (visibility in ('private', 'team', 'org', 'public'));

create index if not exists idx_agents_visibility on public.agents(visibility);

-- 2. Add forked_from to track clones (agents)
alter table public.agents
  add column if not exists forked_from uuid references public.agents(id) on delete set null;

-- 3. Add forked_from to track clones (knowledge_units)
alter table public.knowledge_units
  add column if not exists forked_from uuid references public.knowledge_units(id) on delete set null;

-- 4. Expand KU visibility check to include 'public'
alter table public.knowledge_units
  drop constraint if exists knowledge_units_visibility_check;

alter table public.knowledge_units
  add constraint knowledge_units_visibility_check
    check (visibility in ('private', 'team', 'org', 'public'));

-- 5. Add clone_count to track popularity
alter table public.agents
  add column if not exists clone_count integer not null default 0;

alter table public.knowledge_units
  add column if not exists clone_count integer not null default 0;

-- 6. RLS: allow authenticated users to SELECT public agents (cross-org)
create policy "anyone can view public agents"
on public.agents
for select
to authenticated
using (visibility = 'public' and status = 'published');

-- 7. RLS: allow authenticated users to SELECT public KUs (cross-org)
create policy "anyone can view public kus"
on public.knowledge_units
for select
to authenticated
using (visibility = 'public' and status = 'Publicada');
