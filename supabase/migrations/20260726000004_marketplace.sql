-- Marketplace extensions for agents: public visibility, ratings, cloning.

-- Add marketplace columns to agents
alter table public.agents
  add column if not exists visibility text default 'private' not null check (visibility in ('private', 'public', 'unlisted')),
  add column if not exists rating real default 0 not null,
  add column if not exists ratings_count integer default 0 not null,
  add column if not exists cloned_from uuid references public.agents(id) on delete set null,
  add column if not exists tags text[] default '{}' not null;

-- Agent ratings: one rating per user per agent
create table if not exists public.agent_ratings (
  id uuid default extensions.uuid_generate_v4() primary key,
  agent_id uuid references public.agents(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  created_at timestamptz default now() not null,
  unique(agent_id, user_id)
);

alter table public.agent_ratings enable row level security;

create policy "Org members can view ratings"
  on public.agent_ratings for select
  using (
    exists (
      select 1 from public.agents a
      join public.memberships m on m.organization_id = a.organization_id
      where a.id = agent_ratings.agent_id and m.user_id = auth.uid()
    )
  );

create policy "Org members can rate their org's agents"
  on public.agent_ratings for insert
  with check (
    exists (
      select 1 from public.agents a
      join public.memberships m on m.organization_id = a.organization_id
      where a.id = agent_ratings.agent_id and m.user_id = auth.uid()
    )
  );

create policy "Users can update their own ratings"
  on public.agent_ratings for update
  using (user_id = auth.uid());

create index idx_agent_ratings_agent on public.agent_ratings(agent_id);

-- Function to recalculate agent rating average
create or replace function public.recalc_agent_rating(agent_id uuid)
returns void
language sql
security definer set search_path = ''
as $$
  update public.agents
  set rating = coalesce((select avg(rating) from public.agent_ratings where agent_ratings.agent_id = $1), 0),
      ratings_count = (select count(*) from public.agent_ratings where agent_ratings.agent_id = $1)
  where id = $1;
$$;